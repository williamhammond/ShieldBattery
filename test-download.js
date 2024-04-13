const { MapStore } = require('./app/game/map-store')

async function testDownload() {
  const mapStore = new MapStore('./maps')
  const mapHash = 'testhash' // Replace with an actual map hash
  const mapFormat = 'scx' // Replace with the actual map format
  const mapUrl = 'http://example.com/map.scx' // Replace with an actual map URL

  try {
    const success = await mapStore.downloadMap(mapHash, mapFormat, mapUrl)
    console.log('Download success:', success)
  } catch (err) {
    console.error('Download failed:', err)
  }
}

testDownload()
