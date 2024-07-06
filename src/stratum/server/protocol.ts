export interface RequestMappings {
  'mining.subscribe': [ string, string ] // miner identifier & protocol
  'mining.authorize': [ string, string ] // address.name & passwd
  'mining.submit': [ string, string, string ] // address.name of worker & jobid & nonce 
}

export interface RequestMessage<M extends keyof ResponseMappings = keyof ResponseMappings> {
  id: number
  method: M
  params: RequestMappings[M]
}

export type Request<M extends keyof ResponseMappings = keyof ResponseMappings> = {
  [ K in M]: RequestMessage<K>
}[ M ]

export interface ResponseMappings {
  "mining.subscribe": [ boolean, string ] // EthereumStratum/1.0.0
  'mining.authorize': boolean // TRUE
  'mining.submit': boolean // TRUE
}

type Error = [
  number, // Error code
  string, // Human-readable explanation
  string | null // Stack trace
]

export interface Response<M extends keyof RequestMappings = keyof RequestMappings> {
  id: number
  result: ResponseMappings[M] | null
  error: null | Error
}

export const errors: { [key: string]: Error } = {
  "UNKNOWN": [20, 'Unknown problem', null],
  "JOB_NOT_FOUND": [21, 'Job not found', null],
  "DUPLICATE_SHARE": [22, 'Duplicate share submitted', null],
  "LOW_DIFFICULTY_SHARE": [23, 'Invalid difficulty', null],
  "UNAUTHORIZED_WORKER": [24, 'Unauthorized', null],
  "NOT_SUBSCRIBED": [25, 'Not subscribed', null],
}

export interface EventMappings {
  'set_extranonce': [ string ] // 2 bytes
  'mining.set_difficulty': [ number ] // difficulty
  'mining.notify': [ string, string, string? ] // jobid, bigpow && possibly timestamp on 4 u64 protocol
}

export interface Event<M extends keyof EventMappings = keyof EventMappings> {
  method: M
  params: EventMappings[M]
}

export function validateRequest (request: any): request is Request {
  return typeof request === 'object' &&
    typeof request.id === 'number' &&
    typeof request.method === 'string' &&
    Array.isArray(request.params)
}

export function parseMessage (message: string) {
  try {
    const parsedMessage = JSON.parse(message)

    if (!validateRequest(parsedMessage)) return undefined

    return parsedMessage
  } catch {
    return undefined
  }
}