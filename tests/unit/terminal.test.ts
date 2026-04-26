import { describe, it, expect } from 'vitest'
import { parseTerminalCommand } from '../../src/utils'

describe('parseTerminalCommand()', () => {
  it('empty string → empty cmd and args', () =>
    expect(parseTerminalCommand('')).toEqual({ cmd: '', args: [] }))

  it('whitespace only → empty cmd and args', () =>
    expect(parseTerminalCommand('   ')).toEqual({ cmd: '', args: [] }))

  it('single command', () =>
    expect(parseTerminalCommand('ls')).toEqual({ cmd: 'ls', args: [] }))

  it('command with one arg', () =>
    expect(parseTerminalCommand('git log')).toEqual({ cmd: 'git', args: ['log'] }))

  it('command with multiple args', () =>
    expect(parseTerminalCommand('npm run build')).toEqual({ cmd: 'npm', args: ['run', 'build'] }))

  it('uppercase is lowercased for cmd', () =>
    expect(parseTerminalCommand('LS')).toEqual({ cmd: 'ls', args: [] }))

  it('mixed case command', () =>
    expect(parseTerminalCommand('  LS  ')).toEqual({ cmd: 'ls', args: [] }))

  it('args preserve original case', () =>
    expect(parseTerminalCommand('cat README.md')).toEqual({ cmd: 'cat', args: ['README.md'] }))

  it('multiple args', () =>
    expect(parseTerminalCommand('echo hello world')).toEqual({ cmd: 'echo', args: ['hello', 'world'] }))

  it('extra whitespace between tokens is collapsed', () =>
    expect(parseTerminalCommand('git   log')).toEqual({ cmd: 'git', args: ['log'] }))

  it('leading whitespace is trimmed', () =>
    expect(parseTerminalCommand('  whoami')).toEqual({ cmd: 'whoami', args: [] }))

  it('trailing whitespace is trimmed', () =>
    expect(parseTerminalCommand('pwd  ')).toEqual({ cmd: 'pwd', args: [] }))

  it('file with extension in args', () =>
    expect(parseTerminalCommand('cat about.md')).toEqual({ cmd: 'cat', args: ['about.md'] }))

  it('npm run with two sub-args', () =>
    expect(parseTerminalCommand('npm run test:e2e')).toEqual({ cmd: 'npm', args: ['run', 'test:e2e'] }))
})
