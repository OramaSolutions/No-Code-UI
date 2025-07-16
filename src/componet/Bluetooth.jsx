import React, { useState } from 'react';

export default function BLEDeviceConnector() {
    const [device, setDevice] = useState(null);
    const [connected, setConnected] = useState(false);
    const [status, setStatus] = useState("Disconnected");
    const [ledOn, setLedOn] = useState(false);

    const SERVICE_UUID = '12345678-1234-5678-1234-56789abcdef0';  // Your simulated service UUID
    const CHARACTERISTIC_UUID = '12345678-1234-5678-1234-56789abcdef1';  // LED toggle char UUID
    let characteristicRef = null;

    const connectToDevice = async () => {
        if (!navigator.bluetooth) {
            setStatus("Web Bluetooth is not supported in this browser or the device.");
            return;
        }

        try {

            setStatus("Requesting device...");
            const device = await navigator.bluetooth.requestDevice({
                filters: [{ services: [SERVICE_UUID] }]
            });

            setDevice(device);
            setStatus("Connecting...");

            const server = await device.gatt.connect();
            const service = await server.getPrimaryService(SERVICE_UUID);
            const characteristic = await service.getCharacteristic(CHARACTERISTIC_UUID);
            characteristicRef = characteristic;

            // Optionally read initial state
            const value = await characteristic.readValue();
            const ledState = value.getUint8(0) === 1;
            setLedOn(ledState);
            setConnected(true);
            setStatus("Connected to device ✅");

        } catch (error) {
            console.error("Connection failed:", error);
            setStatus(`Error: ${error.message}`);
        }
    };

    const toggleLED = async () => {
        if (!characteristicRef) {
            setStatus("No characteristic found");
            return;
        }
        try {
            const newState = ledOn ? 0 : 1;
            await characteristicRef.writeValue(Uint8Array.of(newState));
            setLedOn(!ledOn);
        } catch (error) {
            console.error("Write failed:", error);
            setStatus("Failed to write value");
        }
    };

    return (
        <div className="p-4 max-w-md mx-auto shadow rounded bg-white text-gray-900">
            <h2 className="text-xl font-bold mb-2">BLE Device Connector</h2>
            <p>Status: {status}</p>
            <div className="mt-4 flex gap-2">
                {!connected ? (
                    <button
                        className="px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={connectToDevice}
                    >
                        Connect to Device
                    </button>
                ) : (
                    <button
                        className={`px-4 py-2 rounded ${ledOn ? 'bg-red-500' : 'bg-green-600'} text-white`}
                        onClick={toggleLED}
                    >
                        Turn {ledOn ? 'OFF' : 'ON'} LED
                    </button>
                )}
            </div>
        </div>
    );
}
