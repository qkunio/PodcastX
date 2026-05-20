/** 基於 1440×1080 畫布的佈局常量，可按比例縮放 */
export const BASE_WIDTH = 1440;
export const BASE_HEIGHT = 1080;

export const layout = {
  coverCard: {
    x: 95,
    y: 80,
    size: 300,
    borderRadius: 28,
  },
  disc: {
    centerX: 500,
    centerY: 230,
    diameter: 280,
    rotationSecondsPerTurn: 4,
    holeRadiusRatio: 0.08,
  },
  title: {
    right: 80,
    top: 100,
    line1FontSize: 72,
    line2FontSize: 88,
    gap: 12,
  },
  subtitle: {
    bottom: 230,
    fontSize: 46,
    fontWeight: 600,
    color: '#ffffff',
    strokeColor: '#000000',
    strokeWidth: 4,
    maxWidth: 1100,
    fadeMs: 200,
  },
  waveBars: {
    barCount: 50,
    barWidth: 5,
    barGap: 4,
    maxHeight: 56,
    bottomOffset: 130,
  },
  playerControls: {
    bottomOffset: 48,
    iconSize: 36,
    gap: 48,
  },
  background: {
    scaleFrom: 1.02,
    scaleTo: 1.06,
    vignetteOpacity: 0.25,
  },
  toneArm: {
    pressStartSec: 0.3,
    pressEndSec: 0.6,
    pressAngleDeg: 8,
    wobbleDeg: 0.6,
    wobblePeriodSec: 4,
  },
} as const;

export const scaleLayout = (width: number, height: number) => {
  const sx = width / BASE_WIDTH;
  const sy = height / BASE_HEIGHT;
  const s = Math.min(sx, sy);

  return {
    sx,
    sy,
    s,
    coverCard: {
      x: layout.coverCard.x * sx,
      y: layout.coverCard.y * sy,
      size: layout.coverCard.size * s,
      borderRadius: layout.coverCard.borderRadius * s,
    },
    disc: {
      centerX: layout.disc.centerX * sx,
      centerY: layout.disc.centerY * sy,
      diameter: layout.disc.diameter * s,
      rotationSecondsPerTurn: layout.disc.rotationSecondsPerTurn,
      holeRadiusRatio: layout.disc.holeRadiusRatio,
    },
    title: {
      right: layout.title.right * sx,
      top: layout.title.top * sy,
      line1FontSize: layout.title.line1FontSize * s,
      line2FontSize: layout.title.line2FontSize * s,
      gap: layout.title.gap * s,
    },
    subtitle: layout.subtitle,
    waveBars: {
      ...layout.waveBars,
      barWidth: layout.waveBars.barWidth * s,
      barGap: layout.waveBars.barGap * s,
      maxHeight: layout.waveBars.maxHeight * s,
      bottomOffset: layout.waveBars.bottomOffset * sy,
    },
    playerControls: {
      ...layout.playerControls,
      bottomOffset: layout.playerControls.bottomOffset * sy,
      iconSize: layout.playerControls.iconSize * s,
      gap: layout.playerControls.gap * s,
    },
    background: layout.background,
    toneArm: layout.toneArm,
  };
};
