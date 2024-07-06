export enum Encoding {
  BigHeader
}

export function encodeJob (hash: string, timestamp: bigint, encoding: Encoding) {
  if (encoding === Encoding.BigHeader) {
    const buffer = Buffer.alloc(8)
    buffer.writeBigUInt64LE(timestamp) // hh
  
    return [ hash + buffer.toString('hex') ] as const
  } else throw Error('Unknown encoding')
}