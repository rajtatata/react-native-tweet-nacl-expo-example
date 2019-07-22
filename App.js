import React, { Component } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import nacl from 'tweet-nacl-react-native-expo'


export default class App extends Component {

  exampleKeyEncodeDecode = async () => {
    // simple example encode decode (with base64)
    // usefull for sharing keys with others or storing in file

    const keyPair = await nacl.box.keyPair()
    const { publicKey, secretKey } = keyPair

    const base64EncodedPublic = nacl.util.encodeBase64(publicKey)
    const base64EncodedPrivate = nacl.util.encodeBase64(secretKey)

    const base64DecodedPublic = nacl.util.decodeBase64(base64EncodedPublic)
    const base64DecodedPrivate = nacl.util.decodeBase64(base64EncodedPrivate)

    console.log({
      publicKey,
      secretKey,
      base64EncodedPublic,
      base64EncodedPrivate,
      base64DecodedPublic,
      base64DecodedPrivate
    })
  }

  exampleEncryptDecrypt = async () => {
    // simple encrypt decrypt example
    // uses self secretKey together with others publicKey to derive a sharedKey (Diffie–Hellman logic)
    // sharedKey is used to encrypt and decrypt the messages between the two (symmetric encryption)

    const bobKeyPair = await nacl.box.keyPair()
    const aliceKeyPair = await nacl.box.keyPair()

    // Alice and Bob will derive the same shared key
    const bobSharedKey = nacl.box.before(aliceKeyPair.publicKey, bobKeyPair.secretKey)
    const aliceSharedKey = nacl.box.before(bobKeyPair.publicKey, aliceKeyPair.secretKey)

    // Bob decodes the message he wants to send 
    // (for messages we will use UTF8 encoding/decoding)
    // Bob generates a random nonce value
    // Bob encrypts the decoded message using the nonce and the sharedKey
    // Bob encodes the encrypted message (Uint8Array) into a string (base64)
    // Note that Bob will send the encrypted message together 
    //  with nonce (plain text) to Alice in order for her to decrypt
    const str = "Hello Alice , this is Bob! ;'[]{} bla bla"
    const strDecoded = new Uint8Array(nacl.util.decodeUTF8(str))
    const nonce = await nacl.randomBytes(24)
    const bobEncryptedStr = nacl.box.after(strDecoded, nonce, bobSharedKey)
    const bobBase64EncryptedStr = nacl.util.encodeBase64(bobEncryptedStr)

    // Alice decodes the string (base64) to Uint8Array (this gives her bobEncryptedStr)
    // Alice decrypts the message using the nonce and the sharedKey (this gives her strDecoded)
    // Alice then encodes the result to get the final message in plain text
    const messageFromBobDecoded = nacl.util.decodeBase64(bobBase64EncryptedStr) // same as bobEncryptedStr
    const messageFromBobDecrypted = nacl.box.open.after(messageFromBobDecoded, nonce, aliceSharedKey) // same as strDecoded
    const messageFromBobEncoded = nacl.util.encodeUTF8(messageFromBobDecrypted) // same as str

    console.log({
      bob: {
        keypair: {
          publicKey: nacl.util.encodeBase64(bobKeyPair.publicKey),
          secretKey: nacl.util.encodeBase64(bobKeyPair.secretKey)
        },
        sharedKey: nacl.util.encodeBase64(bobSharedKey),
        messagePlain: str,
        messageEncrypted: bobBase64EncryptedStr
      },
      alice: {
        keypair: {
          publicKey: nacl.util.encodeBase64(aliceKeyPair.publicKey),
          secretKey: nacl.util.encodeBase64(aliceKeyPair.secretKey)
        },
        sharedKey: nacl.util.encodeBase64(aliceSharedKey),
        messageDecrypted: messageFromBobEncoded,
      },
    })
  }

  componentDidMount = async () => {
    // await this.exampleKeyEncodeDecode()
    await this.exampleEncryptDecrypt()
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Hello World!</Text>
      </View>
    )
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'blue',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    color: "white",
    fontSize: 30,
    fontWeight: "bold"
  }
})
