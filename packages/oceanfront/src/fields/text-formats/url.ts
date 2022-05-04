import { FieldContext } from '../../lib/fields'
import { h, VNode } from 'vue'

const fixUrl = (value: string): string => {
  let url = value,
    tail

  // fix duplicate schema
  while ((tail = url.match(/(.*:\/\/.*?)(\w+:\/\/.*)$/))) url = tail[2]

  // fix issues like a double paste by looking for common schemas
  // http://www.example.comhttp://www.example.com -> comhttp://www.example.com -> http://www.example.com
  const sch = url.match(/^(.*?(file|https?|ftp))?(:\/\/.*)/i)
  if (sch && sch[2]) url = sch[2] + sch[3]

  // fix :/ instead of ://
  url = url.replace(/:\/([^\/])/, '://$1')

  // fix missing schema
  if (!/:\/\//.test(url) && url.length) url = 'http://' + url

  return url
}

const fixedContent = (
  value: string,
  // eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
  _props: any,
  _ctx: FieldContext
): VNode => {
  const url = fixUrl(value)
  return h('a', { href: url, target: '_blank' }, url)
}

export default fixedContent
