#!/usr/bin/env node

/**
 * Verifies Supabase project credentials format and (optionally) network reachability.
 * Usage:
 *   NEXT_PUBLIC_SUPABASE_URL=... NEXT_PUBLIC_SUPABASE_ANON_KEY=... SUPABASE_SERVICE_ROLE_KEY=... node scripts/006_verify_supabase_config.mjs
 */

function decodeJwt(token) {
  const parts = token.split('.')
  if (parts.length !== 3) {
    throw new Error('Invalid JWT format')
  }
  const payload = parts[1]
    .replace(/-/g, '+')
    .replace(/_/g, '/')
    .padEnd(Math.ceil(parts[1].length / 4) * 4, '=')
  return JSON.parse(Buffer.from(payload, 'base64').toString('utf8'))
}

function normalize(v = '') {
  const trimmed = v.trim()
  if (
    (trimmed.startsWith('"') && trimmed.endsWith('"')) ||
    (trimmed.startsWith("'") && trimmed.endsWith("'"))
  ) {
    return trimmed.slice(1, -1).trim()
  }
  return trimmed
}

function mask(v = '') {
  if (!v) return '<empty>'
  if (v.length < 12) return '***'
  return `${v.slice(0, 6)}...${v.slice(-6)}`
}

function isJwt(v = '') {
  return v.split('.').length === 3
}

async function main() {
  const url = normalize(process.env.NEXT_PUBLIC_SUPABASE_URL || '')
  const anon = normalize(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '')
  const service = normalize(process.env.SUPABASE_SERVICE_ROLE_KEY || '')

  const errors = []
  const notes = []

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase project URL')
  }

  if (!anon.startsWith('sb_publishable_') && !isJwt(anon)) {
    errors.push('NEXT_PUBLIC_SUPABASE_ANON_KEY must be a publishable key or a JWT anon key')
  }

  let projectRefFromAnon = ''
  if (isJwt(anon)) {
    try {
      const payload = decodeJwt(anon)
      if (payload.role !== 'anon') {
        errors.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY role mismatch: ${payload.role}`)
      }
      projectRefFromAnon = payload.ref || ''
    } catch (e) {
      errors.push(`NEXT_PUBLIC_SUPABASE_ANON_KEY decode failed: ${e.message}`)
    }
  } else {
    notes.push('Using publishable anon key format (sb_publishable_...)')
  }

  let projectRefFromService = ''
  try {
    const payload = decodeJwt(service)
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
    errors.push('Project ref mismatch between URL and service key')
  }

  if (projectRefFromAnon && projectRefFromService && projectRefFromAnon !== projectRefFromService) {
    errors.push('Project ref mismatch between anon key and service key')
  }

  let networkCheck = 'skipped'
  try {
    const res = await fetch(`${url}/auth/v1/settings`, { headers: { apikey: anon } })
    networkCheck = `HTTP ${res.status}`
    if (!res.ok) {
      notes.push('Network reachable but anon/publishable key check did not return 2xx')
    }
  } catch (e) {
    notes.push(`Network check failed in this environment: ${e.message}`)
  }

  console.log('Supabase URL:', url)
  console.log('Anon/publishable key:', mask(anon))
  console.log('Service key:', mask(service))
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
