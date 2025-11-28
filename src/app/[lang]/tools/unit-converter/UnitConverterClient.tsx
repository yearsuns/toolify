"use client";

import { useState, useEffect, useMemo } from "react";
import { useLanguage } from "@/contexts/LanguageContext";
import { useToast } from "@/contexts/ToastContext";
import Dropdown from "@/components/common/Dropdown";

type Category = "length" | "weight" | "temperature" | "volume" | "area" | "speed" | "time" | "data";

interface ConversionRates {
  [key: string]: number; // Conversion rate to base unit
}

// Base units: meter, kilogram, celsius, liter, squareMeter, meterPerSecond, second, byte
const conversionRates: Record<Category, ConversionRates> = {
  length: {
    meter: 1,
    kilometer: 1000,
    centimeter: 0.01,
    millimeter: 0.001,
    mile: 1609.344,
    yard: 0.9144,
    foot: 0.3048,
    inch: 0.0254,
  },
  weight: {
    kilogram: 1,
    gram: 0.001,
    pound: 0.453592,
    ounce: 0.0283495,
    ton: 1000,
    stone: 6.35029,
  },
  temperature: {
    celsius: 1, // Special handling
    fahrenheit: 1, // Special handling
    kelvin: 1, // Special handling
  },
  volume: {
    liter: 1,
    milliliter: 0.001,
    gallon: 3.78541,
    quart: 0.946353,
    pint: 0.473176,
    cup: 0.236588,
    cubicMeter: 1000,
    cubicFoot: 28.3168,
  },
  area: {
    squareMeter: 1,
    squareKilometer: 1000000,
    squareFoot: 0.092903,
    squareInch: 0.00064516,
    acre: 4046.86,
    hectare: 10000,
  },
  speed: {
    meterPerSecond: 1,
    kilometerPerHour: 0.277778,
    milePerHour: 0.44704,
    footPerSecond: 0.3048,
    knot: 0.514444,
  },
  time: {
    second: 1,
    minute: 60,
    hour: 3600,
    day: 86400,
    week: 604800,
    month: 2592000, // 30 days
    year: 31536000, // 365 days
  },
  data: {
    byte: 1,
    kilobyte: 1024,
    megabyte: 1048576,
    gigabyte: 1073741824,
    terabyte: 1099511627776,
    petabyte: 1125899906842624,
  },
};

export default function UnitConverterClient() {
  const { t } = useLanguage();
  const { showToast } = useToast();
  const [category, setCategory] = useState<Category>("length");
  const [fromUnit, setFromUnit] = useState<string>("meter");
  const [toUnit, setToUnit] = useState<string>("kilometer");
  const [inputValue, setInputValue] = useState("");
  const [outputValue, setOutputValue] = useState("");

  // Get available units for current category
  const availableUnits = useMemo(() => {
    return Object.keys(conversionRates[category]);
  }, [category]);

  // Reset units when category changes
  useEffect(() => {
    const units = availableUnits;
    if (units.length > 0) {
      setFromUnit(units[0]);
      setToUnit(units[Math.min(1, units.length - 1)]);
    }
    setInputValue("");
    setOutputValue("");
  }, [category, availableUnits]);

  // Convert temperature (special handling)
  const convertTemperature = (value: number, from: string, to: string): number => {
    // Convert to Celsius first
    let celsius = value;
    if (from === "fahrenheit") {
      celsius = (value - 32) * (5 / 9);
    } else if (from === "kelvin") {
      celsius = value - 273.15;
    }

    // Convert from Celsius to target
    if (to === "fahrenheit") {
      return celsius * (9 / 5) + 32;
    } else if (to === "kelvin") {
      return celsius + 273.15;
    }
    return celsius;
  };

  // Convert units
  const convert = () => {
    const value = parseFloat(inputValue);
    
    if (isNaN(value)) {
      setOutputValue("");
      return;
    }

    if (category === "temperature") {
      const result = convertTemperature(value, fromUnit, toUnit);
      setOutputValue(result.toFixed(6).replace(/\.?0+$/, ""));
    } else {
      const rates = conversionRates[category];
      const fromRate = rates[fromUnit];
      const toRate = rates[toUnit];
      
      if (fromRate && toRate) {
        // Convert to base unit, then to target unit
        const baseValue = value * fromRate;
        const result = baseValue / toRate;
        setOutputValue(result.toFixed(6).replace(/\.?0+$/, ""));
      }
    }
  };

  // Auto-convert when input changes
  useEffect(() => {
    if (inputValue && !isNaN(parseFloat(inputValue))) {
      convert();
    } else {
      setOutputValue("");
    }
  }, [inputValue, fromUnit, toUnit, category]);

  // Swap units
  const swapUnits = () => {
    const temp = fromUnit;
    setFromUnit(toUnit);
    setToUnit(temp);
  };

  // Clear all
  const clearAll = () => {
    setInputValue("");
    setOutputValue("");
  };

  // Copy to clipboard
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(t.unitConverter.copied, "success");
    }).catch(() => {
      showToast(t.unitConverter.copyFailed, "error");
    });
  };

  // Get unit display name
  const getUnitName = (unitKey: string): string => {
    const unitMap = t.unitConverter.units[category] as Record<string, string>;
    return unitMap[unitKey] || unitKey;
  };

  // Get category options
  const categoryOptions = Object.keys(t.unitConverter.categories).map((key) => ({
    value: key,
    label: t.unitConverter.categories[key as Category],
  }));

  // Get unit options for current category
  const unitOptions = availableUnits.map((key) => ({
    value: key,
    label: getUnitName(key),
  }));

  return (
    <div className="space-y-6 mb-4">
      {/* Category selector */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-cyan-300">{t.unitConverter.category}</label>
        <Dropdown
          trigger={
            <span className="px-4 py-3 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm text-cyan-300 hover:bg-[#0f0f1f] hover:border-cyan-400/40 transition-all flex items-center justify-between cursor-pointer w-full">
              <span>{t.unitConverter.categories[category]}</span>
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </span>
          }
          width="w-full max-w-xs"
        >
          <div className="p-2">
            {categoryOptions.map((option, index) => (
              <button
                key={option.value}
                onClick={() => setCategory(option.value as Category)}
                className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                  index > 0 ? "mt-1" : ""
                } ${
                  category === option.value
                    ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                    : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                }`}
              >
                {option.label}
              </button>
            ))}
          </div>
        </Dropdown>
      </div>

      {/* Unit selectors and input/output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* From unit */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-300">{t.unitConverter.from}</label>
            <Dropdown
              trigger={
                <span className="px-4 py-3 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm text-cyan-300 hover:bg-[#0f0f1f] hover:border-cyan-400/40 transition-all flex items-center justify-between cursor-pointer w-full max-w-xs">
                  <span>{getUnitName(fromUnit)}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              }
              width="w-full max-w-xs"
            >
              <div className="p-2">
                {unitOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setFromUnit(option.value)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      index > 0 ? "mt-1" : ""
                    } ${
                      fromUnit === option.value
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                        : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-cyan-300">{t.unitConverter.input}</label>
              <button
                onClick={() => copyToClipboard(inputValue)}
                className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
              >
                {t.unitConverter.copy}
              </button>
            </div>
            <input
              type="number"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={t.unitConverter.inputPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm text-cyan-50 placeholder-cyan-500/50 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-400/30 transition-all"
            />
          </div>
        </div>

        {/* To unit */}
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-cyan-300">{t.unitConverter.to}</label>
            <Dropdown
              trigger={
                <span className="px-4 py-3 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm text-cyan-300 hover:bg-[#0f0f1f] hover:border-cyan-400/40 transition-all flex items-center justify-between cursor-pointer w-full max-w-xs">
                  <span>{getUnitName(toUnit)}</span>
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </span>
              }
              width="w-full max-w-xs"
            >
              <div className="p-2">
                {unitOptions.map((option, index) => (
                  <button
                    key={option.value}
                    onClick={() => setToUnit(option.value)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                      index > 0 ? "mt-1" : ""
                    } ${
                      toUnit === option.value
                        ? "bg-cyan-500/20 text-cyan-300 border border-cyan-400/30"
                        : "text-cyan-400/70 hover:bg-cyan-500/10 hover:text-cyan-300"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </Dropdown>
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-cyan-300">{t.unitConverter.output}</label>
              <button
                onClick={() => outputValue && copyToClipboard(outputValue)}
                className="text-xs text-cyan-400/70 hover:text-cyan-300 transition-colors"
              >
                {t.unitConverter.copy}
              </button>
            </div>
            <input
              type="text"
              value={outputValue}
              readOnly
              placeholder={t.unitConverter.outputPlaceholder}
              className="w-full px-4 py-3 rounded-xl border border-cyan-500/30 bg-[#0f0f1f]/80 backdrop-blur-sm text-cyan-50 placeholder-cyan-500/50 focus:outline-none cursor-default"
            />
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-wrap gap-3">
        <button
          onClick={swapUnits}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.unitConverter.swap}
        </button>
        <button
          onClick={clearAll}
          className="px-4 py-2 rounded-lg border border-cyan-500/30 bg-cyan-500/10 text-cyan-300 hover:bg-cyan-500/20 hover:border-cyan-400/50 transition-all"
        >
          {t.unitConverter.clear}
        </button>
      </div>
    </div>
  );
}

