import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { tickResources } from '../../store/resourcesSlice';

export const GameTicker = () => {
    const dispatch = useDispatch();

    useEffect(() => {
        const interval = setInterval(() => {
            // Logic for production calculation will eventually go here
            // For now, static base rates
            dispatch(tickResources({
                food: 1,
                wood: 1,
                stone: 0.5,
                gold: 0.2
            }));
        }, 1000); // 1 second tick

        return () => clearInterval(interval);
    }, [dispatch]);

    return null; // Invisible component
};
