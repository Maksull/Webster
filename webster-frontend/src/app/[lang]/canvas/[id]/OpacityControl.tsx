import React from 'react';
import { Dictionary } from '@/get-dictionary';
import {useDrawing} from "@/contexts";

interface OpacityControlProps {
    dict: Dictionary;
}

const OpacityControl: React.FC<OpacityControlProps> = ({ dict }) => {
    const { opacity, setOpacity } = useDrawing()

    return (
        <div className="flex flex-col space-y-2">
            <label className="text-sm text-slate-700 dark:text-gray-200">
                {dict.drawing?.opacity || 'Opacity'}
            </label>
            <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={opacity}
                onChange={(e) => setOpacity(parseFloat(e.target.value))}
                className="w-full"
            />
        </div>
    );
};

export default OpacityControl;
