function extractLatLng(url) {
  const coordPattern1 = /@(-?\d+\.\d+),(-?\d+\.\d+)/; // Matches @lat,lng
  const coordPattern2 = /!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/; // Matches !3dlat!4dlng

  let match = url.match(coordPattern1);
  if (match) {
    return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }

  match = url.match(coordPattern2);
  if (match) {
    return { latitude: parseFloat(match[1]), longitude: parseFloat(match[2]) };
  }

  return null;
}

module.exports = extractLatLng;
