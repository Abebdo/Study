#!/usr/bin/env node

/**
 * Verifies Supabase project credentials format and (optionally) network reachability.
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... SUPABASE_JWT_SECRET=... node scripts/006_verify_supabase_config.mjs
 */

import { createHmac, timingSafeEqual } from 'node:crypto'

function decodeB64Url(value) {
  const normalized = value.replace(/-/g, '+').replace(/_/g, '/').padEnd(Math.ceil(value.length / 4) * 4, '=')
  return Buffer.from(normalized, 'base64')
}

function decodeJwt(token) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }

  const payload = JSON.parse(decodeB64Url(parts[1]).toString('utf8'))
  return { payload, signingInput: `${parts[0]}.${parts[1]}`, signature: decodeB64Url(parts[2]) }
}

function decodeJwtSecret(jwtSecret) {
  if (!jwtSecret) return null

  try {
    return Buffer.from(jwtSecret, 'base64')
  } catch {
    return null
  }
}

function verifyJwtSignature(token, secret) {
  const { signingInput, signature } = decodeJwt(token)
  const expectedSignature = createHmac('sha256', secret).update(signingInput).digest()

  if (expectedSignature.length !== signature.length) {
    return false
  }

  return timingSafeEqual(expectedSignature, signature)
}

function mask(v = '') {
  if (!v) return '<empty>'
  if (v.length < 12) return '***'
  return `${v.slice(0, 6)}...${v.slice(-6)}`
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
  const jwtSecret = process.env.SUPABASE_JWT_SECRET || ''

  const errors = []
  const notes = []

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase project URL')
  }

  if (!anon.startsWith('sb_publishable_')) {
    notes.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is expected to start with sb_publishable_ in newer projects')
  }

  let projectRefFromAnon = ''
  try {
    const { payload } = decodeJwt(anon)
    if (payload.role !== 'anon') {
      errors.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY role mismatch: ${payload.role}`)
    }

    projectRefFromAnon = payload.ref || ''
    if (!projectRefFromAnon) {
      errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY missing ref claim')
    }
  } catch (e) {
    errors.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY decode failed: ${e.message}`)
  }

  let projectRefFromService = ''
  try {
    const { payload } = decodeJwt(service)
    if (payload.role !== 'service_role') {
      errors.push(`SUPABASE_SERVICE_ROLE_KEY role mismatch: ${payload.role}`)
    }

    projectRefFromService = payload.ref || ''
    if (!projectRefFromService) {
      errors.push('SUPABASE_SERVICE_ROLE_KEY missing ref claim')
    }
  } catch (e) {
    errors.push(`SUPABASE_SERVICE_ROLE_KEY decode failed: ${e.message}`)
  }

  if (projectRefFromService && !url.includes(`://${projectRefFromService}.supabase.co`)) {
    errors.push('Project ref mismatch between URL and service role key')
  }

  if (projectRefFromAnon && !url.includes(`://${projectRefFromAnon}.supabase.co`)) {
    errors.push('Project ref mismatch between URL and anon key')
  }

  if (projectRefFromAnon && projectRefFromService && projectRefFromAnon !== projectRefFromService) {
    errors.push('Project ref mismatch between anon key and service role key')
  }

  const jwtSigningSecret = decodeJwtSecret(jwtSecret)
  if (!jwtSigningSecret || !jwtSigningSecret.length) {
    notes.push('SUPABASE_JWT_SECRET was not provided or is invalid base64; signature validation skipped')
  } else {
    try {
      if (!verifyJwtSignature(anon, jwtSigningSecret)) {
        errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY signature does not match SUPABASE_JWT_SECRET')
      }
      if (!verifyJwtSignature(service, jwtSigningSecret)) {
        errors.push('SUPABASE_SERVICE_ROLE_KEY signature does not match SUPABASE_JWT_SECRET')
      }
    } catch (e) {
      errors.push(`JWT signature validation failed: ${e.message}`)
    }
  }

  let networkCheck = 'skipped'
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anon } })
    networkCheck = `HTTP ${res.status}`
    if (!res.ok) {
      notes.push('Network reachable but publishable key check did not return 2xx')
    }
  } catch (e) {
    notes.push(`Network check failed in this environment: ${e.message}`)
  }

  console.log('Supabase URL:', url)
  console.log('Publishable key:', mask(anon))
  console.log('Service key:', mask(service))
  console.log('JWT secret:', mask(jwtSecret))
  console.log('Network check:', networkCheck)

  if (notes.length) {
    console.log('\nNotes:')
    for (const n of notes) console.log('-', n)
  }

  if (errors.length) {
    console.log('\nValidation errors:')
    for (const err of errors) console.log('-', err)
    process.exit(1)
  }

  console.log('\nLocal credential validation: PASS')
}

main()
