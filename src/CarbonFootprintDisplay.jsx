import { useCarbonFootprint } from 'react-carbon-footprint';

const CarbonFootprintDisplay = () => {
    const [gCO2, bytesTransferred] = useCarbonFootprint();
    return (
        <div style={{
            position: 'fixed', bottom: 10, right: 10,
            background: 'rgba(255,255,255,0.8)', padding: '10px',
            borderRadius: '5px', zIndex: 1000, fontSize: '12px'
        }}>
            <h3>Carbon Footprint</h3>
            <p>Bytes Transferred: {bytesTransferred} bytes</p>
            <p>CO2 Emissions: {gCO2.toFixed(2)} grams CO2eq</p>
        </div>
    );
};

export default CarbonFootprintDisplay;