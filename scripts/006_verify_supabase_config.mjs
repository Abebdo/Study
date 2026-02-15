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

function mask(v = '') {
  if (!v) return '<empty>'
  if (v.length < 12) return '***'
  return `${v.slice(0, 6)}...${v.slice(-6)}`
}

async function main() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
  const service = process.env.SUPABASE_SERVICE_ROLE_KEY || ''

  const errors = []
  const notes = []

  if (!url.startsWith('https://') || !url.includes('.supabase.co')) {
    errors.push('NEXT_PUBLIC_SUPABASE_URL is not a valid Supabase project URL')
  }

  if (!anon.startsWith('sb_publishable_')) {
    notes.push('NEXT_PUBLIC_SUPABASE_ANON_KEY is expected to start with sb_publishable_ in newer projects')
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
