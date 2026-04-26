import { describe, it, expect } from 'vitest'
import { esc } from '../../src/utils'

describe('esc()', () => {
  it('passes through plain text', () => expect(esc('hello')).toBe('hello'))
  it('handles empty string', () => expect(esc('')).toBe(''))
  it('escapes <', () => expect(esc('<')).toBe('&lt;'))
  it('escapes >', () => expect(esc('>')).toBe('&gt;'))
  it('escapes &', () => expect(esc('&')).toBe('&amp;'))
  it('escapes "', () => expect(esc('"')).toBe('&quot;'))
  it("escapes '", () => expect(esc("'")).toBe('&#39;'))
  it('escapes script tag', () => expect(esc('<script>alert(1)</script>')).toBe('&lt;script&gt;alert(1)&lt;/script&gt;'))
  it('escapes mixed', () => expect(esc('<b class="x">it\'s &amp; fun</b>')).toBe('&lt;b class=&quot;x&quot;&gt;it&#39;s &amp;amp; fun&lt;/b&gt;'))
  it('coerces number to string', () => expect(esc(123)).toBe('123'))
  it('coerces null to string', () => expect(esc(null)).toBe('null'))
  it('all 5 special chars at once', () =>
    expect(esc('<>&"\'')).toBe('&lt;&gt;&amp;&quot;&#39;'))
  it('unicode passes through unchanged', () =>
    expect(esc('Cześć 🎉 日本語')).toBe('Cześć 🎉 日本語'))
  it('polish diacritics pass through', () =>
    expect(esc('łóżko żółte')).toBe('łóżko żółte'))
  it('long string is fully escaped', () => {
    const input = '<a href="test">it\'s a & b</a>'.repeat(100)
    const result = esc(input)
    expect(result).not.toContain('<')
    expect(result).not.toContain('>')
    expect(result).not.toContain('"')
    expect(result).not.toContain("'")
    expect(result.split('&amp;').length - 1).toBe(100)
  })
  it('coerces undefined to string', () => expect(esc(undefined)).toBe('undefined'))
  it('coerces boolean to string', () => expect(esc(true)).toBe('true'))
  it('coerces array to string', () => expect(esc([1, 2])).toBe('1,2'))
})
