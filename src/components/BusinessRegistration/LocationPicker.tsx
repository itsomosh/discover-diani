import React, { useCallback, useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker, Autocomplete } from '@react-google-maps/api';

interface Location {
    lat: number;
    lng: number;
    address: string;
}

interface LocationPickerProps {
    onLocationSelect: (location: Location) => void;
    initialLocation?: Location;
}

const defaultCenter = {
    lat: Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LAT),
    lng: Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LNG)
};

const mapContainerStyle = {
    width: '100%',
    height: '400px'
};

const libraries: ("places" | "drawing" | "geometry" | "localContext" | "visualization")[] = ["places"];

export const LocationPicker: React.FC<LocationPickerProps> = ({ onLocationSelect, initialLocation }) => {
    const [map, setMap] = useState<google.maps.Map | null>(null);
    const [marker, setMarker] = useState<google.maps.LatLng | null>(null);
    const [autocomplete, setAutocomplete] = useState<google.maps.places.Autocomplete | null>(null);
    const [address, setAddress] = useState('');

    // Initialize marker if initial location is provided
    useEffect(() => {
        if (initialLocation) {
            setMarker(new google.maps.LatLng(initialLocation.lat, initialLocation.lng));
            setAddress(initialLocation.address);
        }
    }, [initialLocation]);

    const onLoad = useCallback((map: google.maps.Map) => {
        setMap(map);
        
        // Set initial bounds to Diani Beach area
        const bounds = new google.maps.LatLngBounds();
        bounds.extend(new google.maps.LatLng(
            Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LAT) - 0.1,
            Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LNG) - 0.1
        ));
        bounds.extend(new google.maps.LatLng(
            Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LAT) + 0.1,
            Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LNG) + 0.1
        ));
        map.fitBounds(bounds);
    }, []);

    const onUnmount = useCallback(() => {
        setMap(null);
    }, []);

    const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
        if (e.latLng) {
            setMarker(e.latLng);
            // Reverse geocode to get address
            const geocoder = new google.maps.Geocoder();
            geocoder.geocode({ location: e.latLng }, (results, status) => {
                if (status === 'OK' && results?.[0]) {
                    setAddress(results[0].formatted_address);
                    onLocationSelect({
                        lat: e.latLng.lat(),
                        lng: e.latLng.lng(),
                        address: results[0].formatted_address
                    });
                }
            });
        }
    }, [onLocationSelect]);

    const onPlaceSelect = () => {
        if (autocomplete) {
            const place = autocomplete.getPlace();
            if (place.geometry?.location) {
                setMarker(place.geometry.location);
                setAddress(place.formatted_address || '');
                map?.panTo(place.geometry.location);
                map?.setZoom(17);
                onLocationSelect({
                    lat: place.geometry.location.lat(),
                    lng: place.geometry.location.lng(),
                    address: place.formatted_address || ''
                });
            }
        }
    };

    const onAutocompleteLoad = (autocomplete: google.maps.places.Autocomplete) => {
        setAutocomplete(autocomplete);
        
        // Set search bounds to Diani Beach area
        const bounds = new google.maps.LatLngBounds(
            new google.maps.LatLng(
                Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LAT) - 0.1,
                Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LNG) - 0.1
            ),
            new google.maps.LatLng(
                Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LAT) + 0.1,
                Number(import.meta.env.VITE_GOOGLE_MAPS_DEFAULT_LNG) + 0.1
            )
        );
        autocomplete.setBounds(bounds);
        
        // Bias results to Diani Beach area
        autocomplete.setOptions({
            strictBounds: true,
            types: ['establishment', 'geocode']
        });
    };

    return (
        <div className="space-y-4">
            <div className="relative">
                <Autocomplete
                    onLoad={onAutocompleteLoad}
                    onPlaceChanged={onPlaceSelect}
                >
                    <input
                        type="text"
                        placeholder="Search for a location in Diani Beach"
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
                    />
                </Autocomplete>
            </div>

            <LoadScript
                googleMapsApiKey={import.meta.env.VITE_GOOGLE_MAPS_API_KEY}
                libraries={libraries}
            >
                <GoogleMap
                    mapContainerStyle={mapContainerStyle}
                    center={defaultCenter}
                    zoom={15}
                    onLoad={onLoad}
                    onUnmount={onUnmount}
                    onClick={onMapClick}
                    options={{
                        streetViewControl: true,
                        mapTypeControl: true,
                        fullscreenControl: true,
                        styles: [
                            {
                                featureType: 'poi',
                                elementType: 'labels',
                                stylers: [{ visibility: 'on' }]
                            }
                        ]
                    }}
                >
                    {marker && (
                        <Marker
                            position={marker}
                            draggable={true}
                            onDragEnd={(e) => {
                                if (e.latLng) {
                                    const geocoder = new google.maps.Geocoder();
                                    geocoder.geocode({ location: e.latLng }, (results, status) => {
                                        if (status === 'OK' && results?.[0]) {
                                            setAddress(results[0].formatted_address);
                                            onLocationSelect({
                                                lat: e.latLng!.lat(),
                                                lng: e.latLng!.lng(),
                                                address: results[0].formatted_address
                                            });
                                        }
                                    });
                                }
                            }}
                        />
                    )}
                </GoogleMap>
            </LoadScript>

            <div className="text-sm text-gray-500">
                Click on the map or search for a location to set your business location. 
                You can also drag the marker to adjust the position.
            </div>
        </div>
    );
};

export default LocationPicker;
