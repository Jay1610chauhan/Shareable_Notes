// Lightweight encryption using Web Crypto API with PBKDF2 + AES-GCM
async function getKeyFromPassword(password, salt){
  const enc = new TextEncoder()
  const baseKey = await crypto.subtle.importKey('raw', enc.encode(password), {name:'PBKDF2'}, false, ['deriveKey'])
  return crypto.subtle.deriveKey({name:'PBKDF2', salt, iterations:100000, hash:'SHA-256'}, baseKey, {name:'AES-GCM', length:256}, false, ['encrypt','decrypt'])
}

export async function encryptText(plain, password){
  const iv = crypto.getRandomValues(new Uint8Array(12))
  const salt = crypto.getRandomValues(new Uint8Array(16))
  const key = await getKeyFromPassword(password, salt)
  const enc = new TextEncoder()
  const ct = await crypto.subtle.encrypt({name:'AES-GCM', iv}, key, enc.encode(plain))
  // store salt and iv with ciphertext, base64
  const combined = new Uint8Array(salt.byteLength + iv.byteLength + ct.byteLength)
  combined.set(salt,0); combined.set(iv,salt.byteLength); combined.set(new Uint8Array(ct), salt.byteLength + iv.byteLength)
  return btoa(String.fromCharCode(...combined))
}

export async function decryptText(b64, password){
  try{
    const raw = Uint8Array.from(atob(b64), c=>c.charCodeAt(0))
    const salt = raw.slice(0,16)
    const iv = raw.slice(16,28)
    const ct = raw.slice(28)
    const key = await getKeyFromPassword(password, salt)
    const plainBuf = await crypto.subtle.decrypt({name:'AES-GCM', iv}, key, ct)
    const dec = new TextDecoder()
    return dec.decode(plainBuf)
  }catch(e){
    throw new Error('Decryption failed')
  }
}
