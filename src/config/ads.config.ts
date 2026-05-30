/**
 * Ads configuration implementing the AdsConfig interface.
 * Controls ad placement positions and global ad settings.
 * All placements are disabled by default.
 */

export interface AdsConfig {
  enabled: boolean;
  adsenseId: string;
  placements: {
    header: boolean;
    sidebar: boolean;
    content: boolean;
    footer: boolean;
  };
}

export const adsConfig: AdsConfig = {
  enabled: false,
  adsenseId: "",
  placements: {
    header: false,
    sidebar: false,
    content: false,
    footer: false,
  },
};
