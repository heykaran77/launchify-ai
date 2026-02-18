import Grainient from '@/components/Grainient';

export default function GreenGrainient() {
  return (
    <div className="pointer-events-none absolute inset-0 -z-10">
      <Grainient
        color1="#2f6552"
        color2="#3cfbb8"
        color3="#015638"
        timeSpeed={0.25}
        colorBalance={0}
        warpStrength={1}
        warpFrequency={5}
        warpSpeed={2}
        warpAmplitude={50}
        blendAngle={0}
        blendSoftness={0.05}
        rotationAmount={500}
        noiseScale={2}
        grainAmount={0.1}
        grainScale={2}
        grainAnimated={false}
        contrast={1.5}
        gamma={1}
        saturation={1}
        centerX={0}
        centerY={0}
        zoom={0.9}
        className="h-full w-full"
      />
    </div>
  );
}
