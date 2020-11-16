// Original test cases are taken from https://github.com/jshttp/proxy-addr/blob/master/test/test.js

import { IncomingMessage } from 'http'
import { proxyaddr } from '../../packages/proxy-addr/src'
import { createReq } from '../../test_helpers/createReq'

const all = () => true

describe('proxyaddr(req, trust)', () => {
  describe('trust', () => {
    it('should accept a function', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, all)).toBe('127.0.0.1')
    })
    it('should accept an array', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, [])).toBe('127.0.0.1')
    })
    it('should reject a number', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      try {
        proxyaddr(req, 1 as any)
      } catch (e) {
        expect(e.message).toBe('unsupported trust argument')
      }
    })
    it('should accept IPv4', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, '127.0.0.1')).toBe('127.0.0.1')
    })
    it('should accept IPv6', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, '::1')).toBe('127.0.0.1')
    })
    it('should accept IPv4-style IPv6', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, '::ffff:127.0.0.1')).toBe('127.0.0.1')
    })
    it('should accept pre-defined names', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, 'loopback')).toBe('127.0.0.1')
    })
    it('should accept pre-defined names', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, ['loopback', '10.0.0.1'])).toBe('127.0.0.1')
    })
    it('should reject non-IP', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      try {
        proxyaddr(req, 'blegh')
      } catch (e) {
        expect(e.message).toContain('invalid IP address')
      }
      try {
        proxyaddr(req, '10.0.300.1')
      } catch (e) {
        expect(e.message).toContain('invalid IP address')
      }
      try {
        proxyaddr(req, '::ffff:30.168.1.9000')
      } catch (e) {
        expect(e.message).toContain('invalid IP address')
      }
      try {
        proxyaddr(req, '-1')
      } catch (e) {
        expect(e.message).toContain('invalid IP address')
      }
    })
    it('should reject bad CIDR', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      try {
        proxyaddr(req, '10.0.0.1/internet')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }

      try {
        proxyaddr(req, '10.0.0.1/6000')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }
    })
  })
})
