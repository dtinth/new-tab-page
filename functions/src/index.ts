import * as functions from 'firebase-functions'
import * as admin from 'firebase-admin'

admin.initializeApp()

export const writeCards = functions.https.onRequest(
  async (request, response) => {
    const key = functions.config().api.key
    const tokenId = (request.get('Authorization') || '').split('Bearer ')[1]
    if (tokenId !== key) {
      response.status(401).send('Nope')
      return
    }
    const db = admin.firestore()
    const cards = db.collection('cards')
    try {
      const written = await db.runTransaction(async tx => {
        const toWrite: (() => void)[] = []
        for (const item of request.body.cards) {
          const ref = cards.doc(item.id)
          const doc = await tx.get(ref)
          if (!doc.exists || item.data.time >= doc.get('time')) {
            toWrite.push(() => {
              tx.set(ref, item.data, { merge: true })
            })
          }
        }
        for (const fn of toWrite) fn()
        return toWrite.length
      })
      response.send('Done, written=' + written)
    } catch (e) {
      response.status(500).send(e)
    }
  },
)
