// Original test cases are taken from https://github.com/jshttp/proxy-addr/blob/master/test/test.js

import { IncomingMessage } from 'http'
import { proxyaddr } from '../../packages/proxy-addr/src'
import { createReq } from '../../test_helpers/createReq'

const all = () => true

const none = () => false

function trust10x(addr: string) {
  return /^10\./.test(addr)
}

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

      try {
        proxyaddr(req, '::1/6000')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }

      try {
        proxyaddr(req, '::ffff:a00:2/136')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }

      try {
        proxyaddr(req, '::ffff:a00:2/-1')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }
    })
    it('should reject bad netmask', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      try {
        proxyaddr(req, '10.0.0.1/255.0.255.0')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }

      try {
        proxyaddr(req, '10.0.0.1/ffc0::')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }

      try {
        proxyaddr(req, 'fe80::/ffc0::')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }

      try {
        proxyaddr(req, 'fe80::/255.255.255.0')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }

      try {
        proxyaddr(req, '::ffff:a00:2/255.255.255.0')
      } catch (e) {
        expect(e.message).toContain('invalid range on address')
      }
    })
    it('should be invoked as trust(addr, i)', () => {
      const log = []

      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.1',
      }) as IncomingMessage

      proxyaddr(req, (addr, i) => {
        return log.push([addr, i])
      })

      expect(log).toStrictEqual([
        ['127.0.0.1', 0],
        ['10.0.0.1', 1],
      ])
    })
  })
  describe('with all trusted', () => {
    it('should return socket address with no headers', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, all)).toBe('127.0.0.1')
    })
    it('should return header value', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1',
      }) as IncomingMessage

      expect(proxyaddr(req, all)).toBe('10.0.0.1')
    })
    it('should return furthest header value', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, all)).toBe('10.0.0.1')
    })
  })

  describe('with none trusted', () => {
    it('should return socket address with no headers', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, none)).toBe('127.0.0.1')
    })
    it('should return socket address with headers', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1',
      }) as IncomingMessage

      expect(proxyaddr(req, none)).toBe('127.0.0.1')
    })
  })

  describe('with some trusted', () => {
    it('should return socket address with no headers', () => {
      const req = createReq('127.0.0.1') as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('127.0.0.1')
    })
    it('should return socket address when not trusted', () => {
      const req = createReq('127.0.0.1', {
        'x-forwarded-for': '10.0.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('127.0.0.1')
    })
    it('should return header when socket trusted', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1',
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('192.168.0.1')
    })
    it('should return first untrusted after trusted', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('192.168.0.1')
    })
    it('should not skip untrusted', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '10.0.0.3, 192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, trust10x)).toBe('192.168.0.1')
    })
  })

  describe('when given array', () => {
    it('should accept literal IP addresses', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('192.168.0.1')
    })
    it('should not trust non-IP addresses', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2, localhost',
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('localhost')
    })
    it('should return socket address if none match', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, ['127.0.0.1', '192.168.0.100'])).toBe('10.0.0.1')
    })

    describe('when array is empty', () => {
      it('should return socket address', () => {
        const req = createReq('127.0.0.1') as IncomingMessage

        expect(proxyaddr(req, [])).toBe('127.0.0.1')
      })
      it('should return socket address', () => {
        const req = createReq('127.0.0.1', {
          'x-forwarded-for': '10.0.0.1, 10.0.0.2',
        }) as IncomingMessage

        expect(proxyaddr(req, [])).toBe('127.0.0.1')
      })
    })
  })

  describe('when given IPv4 address', () => {
    it('should accept literal IP addresses', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('192.168.0.1')
    })
    it('should accept CIDR notation', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.200',
      }) as IncomingMessage

      expect(proxyaddr(req, '10.0.0.2/26')).toBe('10.0.0.200')
    })
    it('should accept netmask notation', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.200',
      }) as IncomingMessage

      expect(proxyaddr(req, '10.0.0.2/255.255.255.192')).toBe('10.0.0.200')
    })
  })
  describe('when given IPv6 address', () => {
    it('should accept literal IP addresses', () => {
      const req = createReq('fe80::1', {
        'x-forwarded-for': '2002:c000:203::1, fe80::2',
      }) as IncomingMessage

      expect(proxyaddr(req, ['fe80::1', 'fe80::2'])).toBe('2002:c000:203::1')
    })
    it('should accept CIDR notation', () => {
      const req = createReq('fe80::1', {
        'x-forwarded-for': '2002:c000:203::1, fe80::ff00',
      }) as IncomingMessage

      expect(proxyaddr(req, 'fe80::/125')).toBe('fe80::ff00')
    })
  })
  describe('with mixed IP versions', () => {
    it('should match respective versions', () => {
      const req = createReq('::1', {
        'x-forwarded-for': '2002:c000:203::1',
      }) as IncomingMessage

      expect(proxyaddr(req, ['127.0.0.1', '::1'])).toBe('2002:c000:203::1')
    })
    it('should not match IPv4 to IPv6', () => {
      const req = createReq('::1', {
        'x-forwarded-for': '2002:c000:203::1',
      }) as IncomingMessage

      expect(proxyaddr(req, '127.0.0.1')).toBe('::1')
    })
  })

  describe('with IPv4-mapped IPv6 addresses', () => {
    it('should match IPv4 trust to IPv6 request', () => {
      const req = createReq('::ffff:a00:1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1', '10.0.0.2'])).toBe('192.168.0.1')
    })
    it('should match IPv4 netmask trust to IPv6 request', () => {
      const req = createReq('::ffff:a00:1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, ['10.0.0.1/16'])).toBe('192.168.0.1')
    })
    it('should match IPv6 trust to IPv4 request', () => {
      const req = createReq('10.0.0.1', {
        'x-forwarded-for': '192.168.0.1, 10.0.0.2',
      }) as IncomingMessage

      expect(proxyaddr(req, ['::ffff:a00:1', '::ffff:a00:2'])).toBe('192.168.0.1')
    })
  })
})
