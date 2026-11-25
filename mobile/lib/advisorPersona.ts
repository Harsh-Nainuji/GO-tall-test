import { ImageSourcePropType } from 'react-native';

export interface AdvisorPersona {
  name: string;
  shortName: string;
  title: string;
  avatar: ImageSourcePropType;
  gender: 'male' | 'female';
  greeting: string;
  errorMessage: string;
  welcomeSub: string;
}

/**
 * Returns the clinical advisor persona calibrated to the user's biological gender:
 * - Female: Dr. Sarah (Pediatric Endocrinology & Stature Specialist) + female-icon-test.png
 * - Male: Dr. Jack (Pediatric Stature & Biomechanical Specialist) + male-icon-test.png
 */
export function getAdvisorPersona(gender?: string | null): AdvisorPersona {
  const isFemale = gender?.toLowerCase() === 'female';
  if (isFemale) {
    return {
      name: 'Dr. Sarah',
      shortName: 'Dr. Sarah AI',
      title: 'Pediatric Endocrinology & Stature Specialist',
      avatar: require('../assets/female-icon-test.png'),
      gender: 'female',
      greeting:
        'Hello! I am Dr. Sarah, your clinical stature and hormonal growth advisor. Ask me anything about your growth plates, nocturnal somatotropin synchronization, spinal decompression, or nutrition!',
      errorMessage:
        'Unable to reach Dr. Sarah growth advisor right now. Please check your network connection and try again.',
      welcomeSub:
        'Evidence-based guidance on epiphyseal biology, slow-wave sleep, and bone mineralization.',
    };
  }

  return {
    name: 'Dr. Jack',
    shortName: 'Dr. Jack AI',
    title: 'Pediatric Stature & Biomechanical Specialist',
    avatar: require('../assets/male-icon-test.png'),
    gender: 'male',
    greeting:
      'Hello! I am Dr. Jack, your clinical growth advisor. Ask me anything about your growth plates, nocturnal somatotropin release, spinal decompression, or nutrition!',
    errorMessage:
      'Unable to reach Dr. Jack growth advisor right now. Please check your network connection and try again.',
    welcomeSub:
      'Evidence-based guidance on growth plates, sleep, nutrition, and spinal biomechanics.',
  };
}
