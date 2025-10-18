import { GoogleMap, MapPin } from '../components/Map/GoogleMap';

function App() {
  const samplePins: MapPin[] = [
    {
      id: '1',
      position: { lat: 35.6812, lng: 139.7671 },
      content: <div className="text-sm">
        <h3 className="font-semibold mb-1">Tokyo Station</h3>
        <p className="text-gray-600">Sample location</p>
      </div>
    },
    {
      id: '2',
      position: { lat: 35.6586, lng: 139.7454 },
      content: <div className="text-sm">
        <h3 className="font-semibold mb-1">Tokyo Tower</h3>
        <p className="text-gray-600">Another location</p>
      </div>
    },
    {
      id: '3',
      position: { lat: 35.7100, lng: 139.8107 },
      content: <div className="text-sm">
        <h3 className="font-semibold mb-1">Tokyo Skytree</h3>
        <p className="text-gray-600">Tall tower</p>
      </div>
    }
  ];

  return (
    <div className="w-screen h-screen">
      <GoogleMap
        center={{ lat: 35.6812, lng: 139.7671 }}
        zoom={12}
        pins={samplePins}
      />
    </div>
  );
}

export default App;