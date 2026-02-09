/**
 * Notification Sounds Service
 * Plays different sounds for each notification type using Web Audio API
 */

type NotificationType = "daily_reminder" | "environment_alert" | "task_reminder";

interface SoundConfig {
  enabled: boolean;
  volume: number; // 0-1
}

const DEFAULT_CONFIG: SoundConfig = {
  enabled: true,
  volume: 0.5,
};

// Storage key for sound settings
const STORAGE_KEY = "notification_sound_config";

/**
 * Get sound configuration from localStorage
 */
export function getSoundConfig(): SoundConfig {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return { ...DEFAULT_CONFIG, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.error("Failed to load sound config:", error);
  }
  return DEFAULT_CONFIG;
}

/**
 * Save sound configuration to localStorage
 */
export function saveSoundConfig(config: Partial<SoundConfig>): void {
  try {
    const current = getSoundConfig();
    const updated = { ...current, ...config };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (error) {
    console.error("Failed to save sound config:", error);
  }
}

/**
 * Generate notification sound using Web Audio API
 * Each type has a distinct tone pattern
 */
function generateSound(type: NotificationType, audioContext: AudioContext, volume: number): void {
  const now = audioContext.currentTime;
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  // Set volume
  gainNode.gain.setValueAtTime(volume, now);

  switch (type) {
    case "daily_reminder":
      // Gentle ascending chime (C5 → E5 → G5)
      oscillator.type = "sine";
      oscillator.frequency.setValueAtTime(523.25, now); // C5
      oscillator.frequency.setValueAtTime(659.25, now + 0.15); // E5
      oscillator.frequency.setValueAtTime(783.99, now + 0.3); // G5
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.6);
      oscillator.start(now);
      oscillator.stop(now + 0.6);
      break;

    case "environment_alert":
      // Urgent double beep (A5 → A5)
      oscillator.type = "square";
      oscillator.frequency.setValueAtTime(880, now); // A5
      gainNode.gain.setValueAtTime(volume, now);
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.2);
      oscillator.start(now);
      oscillator.stop(now + 0.2);

      // Second beep
      setTimeout(() => {
        const osc2 = audioContext.createOscillator();
        const gain2 = audioContext.createGain();
        osc2.connect(gain2);
        gain2.connect(audioContext.destination);
        osc2.type = "square";
        osc2.frequency.setValueAtTime(880, audioContext.currentTime);
        gain2.gain.setValueAtTime(volume, audioContext.currentTime);
        gain2.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
        osc2.start();
        osc2.stop(audioContext.currentTime + 0.2);
      }, 300);
      break;

    case "task_reminder":
      // Pleasant notification tone (E5 → C5)
      oscillator.type = "triangle";
      oscillator.frequency.setValueAtTime(659.25, now); // E5
      oscillator.frequency.setValueAtTime(523.25, now + 0.2); // C5
      gainNode.gain.exponentialRampToValueAtTime(0.01, now + 0.5);
      oscillator.start(now);
      oscillator.stop(now + 0.5);
      break;
  }
}

/**
 * Play notification sound
 */
export function playNotificationSound(type: NotificationType): void {
  const config = getSoundConfig();

  if (!config.enabled || config.volume === 0) {
    return;
  }

  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn("Web Audio API not supported");
      return;
    }

    const audioContext = new AudioContext();
    generateSound(type, audioContext, config.volume);
  } catch (error) {
    console.error("Failed to play notification sound:", error);
  }
}

/**
 * Test sound (for settings page)
 */
export function testSound(type: NotificationType, volume: number): void {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) {
      console.warn("Web Audio API not supported");
      return;
    }

    const audioContext = new AudioContext();
    generateSound(type, audioContext, volume);
  } catch (error) {
    console.error("Failed to test sound:", error);
  }
}
