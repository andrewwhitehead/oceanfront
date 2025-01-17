import { TextFormatter, TextFormatResult } from '../lib/formats'

export class DurationFormatter implements TextFormatter {
  get align(): 'start' | 'center' | 'end' {
    return 'end'
  }

  get inputClass(): string {
    return 'of--text-numeric'
  }

  get inputMode(): string {
    return 'numeric'
  }

  parseInput(input: string) {
    let value = 0
    if (typeof input === 'string' && input.length !== 0) {
      const hr = parseInt(input.split('h ')[0], 10)
      const min = parseInt(input.split('h ')[1].split('m')[0], 10)
      value = hr * 60 + min
    }

    return {
      input,
      value,
    }
  }

  loadValue(modelValue: any): number | null {
    // bigint?
    if (typeof modelValue === 'number') return modelValue
    if (modelValue === null || modelValue === undefined) return null
    if (typeof modelValue === 'string') {
      modelValue = modelValue.trim()
      if (!modelValue.length) return null
      return parseFloat(modelValue)
    }
    throw new TypeError('Unsupported value')
  }

  format(modelValue: any): TextFormatResult {
    let value = modelValue
    let textValue = ''
    let error
    try {
      value = this.loadValue(modelValue)
      if (value != null) {
        textValue = this.minToDurationConvert(modelValue)
      }
    } catch (e) {
      error = e.toString()
    }
    return {
      error,
      value,
      textValue,
    }
  }

  minToDurationConvert(value: string): string {
    let valueNum = parseFloat(value)
    if (valueNum < 10 || valueNum % 1 !== 0) {
      valueNum *= 60
    }
    let min = Math.round(valueNum)
    const hr = Math.floor(min / 60)
    min = min % 60
    return '' + hr + 'h ' + (min < 10 ? '0' + min : min) + 'm'
  }

  unformat(input: any): number | null {
    if (!isNaN(Number(input))) return input
    if (input === null || input === undefined) return null
    if (typeof input === 'string') {
      input = input.trim()
      if (!input.length) return null
      const parsed = this.parseInput(input)
      return parsed.value
    }
    throw new TypeError('Unsupported value')
  }

  handleKeyDown(evt: KeyboardEvent): void {
    // FIXME handle compositionstart, compositionend?
    const input = evt.target as HTMLInputElement
    let selStart = input.selectionStart
    let selEnd = input.selectionEnd
    if (selStart === null || selEnd === null) return
    if (selEnd < selStart) {
      selEnd = selStart
      selStart = input.selectionEnd
    }
    if (evt.key === 'Backspace' || evt.key === 'Delete') {
      // move over separator
      if (selStart === selEnd) {
        if (evt.key === 'Backspace') {
          if (selStart > 0) selStart--
          else return
        } else {
          if (selEnd < input.value.length) selEnd++
          else return
        }
      }
      const range = input.value.substring(selStart!, selEnd)
      if (!range.match(/[0-9]/)) {
        const selPos = (evt.key === 'Backspace' ? selStart : selEnd) as number
        input.setSelectionRange(selPos, selPos)
        evt.preventDefault()
      }
    }
  }
}
