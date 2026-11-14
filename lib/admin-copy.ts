/**
 * Single centralized dictionary for all GoTall Admin Studio UI strings.
 * Bilingual format: English + Gujarati (ગુજરાતી) on a secondary line.
 * Plain, simple words for non-technical operators.
 */

export interface BilingualText {
  en: string
  gu: string
}

export const ADMIN_COPY = {
  brand: {
    title: { en: 'GoTall', gu: 'ગોટૉલ' },
    badge: { en: 'Manager', gu: 'મેનેજર' },
    tagline: { en: 'Simple Control Center', gu: 'સરળ નિયંત્રણ કેન્દ્ર' },
  },

  nav: {
    sectionTitle: { en: 'Main Sections', gu: 'મુખ્ય વિભાગો' },
    overview: {
      label: { en: 'Home', gu: 'મુખ્ય પૃષ્ઠ' },
      sublabel: { en: 'Numbers at a glance', gu: 'એક નજરે આંકડા' },
    },
    stretches: {
      label: { en: 'Exercises', gu: 'કસરતો' },
      sublabel: { en: 'Daily stretches & workout', gu: 'દૈનિક સ્ટ્રેચિંગ અને કસરત' },
    },
    nutrition: {
      label: { en: 'Food & Meals', gu: 'ખોરાક અને ભોજન' },
      sublabel: { en: 'Food & protein catalog', gu: 'ખોરાક અને પ્રોટીન યાદી' },
    },
    badges: {
      label: { en: 'Rewards & Badges', gu: 'ઇનામ અને બેજ' },
      sublabel: { en: 'Trophies & points', gu: 'ટ્રોફી અને પોઇન્ટ્સ' },
    },
    aiPrompts: {
      label: { en: 'AI Helper', gu: 'એઆઈ મદદનીશ' },
      sublabel: { en: 'Instant answer buttons', gu: 'ઝડપી જવાબો' },
    },
    users: {
      label: { en: 'App Members', gu: 'સભ્યો' },
      sublabel: { en: 'Users & VIP access', gu: 'વપરાશકર્તાઓ અને વીઆઈપી' },
    },
    connected: { en: 'App Connected & Live', gu: 'એપ જોડાયેલ છે અને લાઈવ છે' },
    wipeClean: { en: 'Wipe Clean (0 Items)', gu: 'બધો ડેટા સાફ કરો (૦ આઇટમ)' },
  },

  pages: {
    overview: {
      title: { en: 'Home (At a Glance)', gu: 'મુખ્ય પૃષ્ઠ (એક નજરે)' },
      subtitle: {
        en: 'See live members, exercises, food items, and cloud storage health.',
        gu: 'લાઈવ સભ્યો, કસરતો, ખોરાક અને સ્ટોરેજની સ્થિતિ જુઓ.',
      },
    },
    stretches: {
      title: { en: 'Daily Exercises & Stretches', gu: 'દૈનિક કસરતો અને સ્ટ્રેચિંગ' },
      subtitle: {
        en: 'Add, change, or remove stretching routines shown in the mobile app.',
        gu: 'મોબાઇલ એપમાં દેખાતી કસરતો ઉમેરો, બદલો અથવા દૂર કરો.',
      },
      addBtn: { en: '+ Add Exercise', gu: '+ કસરત ઉમેરો' },
      bulkBtn: { en: 'Add many exercises', gu: 'ઘણી કસરતો ઉમેરો' },
    },
    nutrition: {
      title: { en: 'Food & Meals Catalog', gu: 'ખોરાક અને ભોજન યાદી' },
      subtitle: {
        en: 'Manage verified foods, calories, protein grams, and bone minerals.',
        gu: 'ખોરાક, કેલરી, પ્રોટીન અને હાડકાંના પોષક તત્વો સંચાલિત કરો.',
      },
      addBtn: { en: '+ Add Food', gu: '+ ખોરાક ઉમેરો' },
      bulkBtn: { en: 'Add many foods', gu: 'ઘણો ખોરાક ઉમેરો' },
    },
    badges: {
      title: { en: 'Rewards & Milestone Badges', gu: 'ઇનામ અને સિદ્ધિ બેજ' },
      subtitle: {
        en: 'Configure trophies, medal tiers, and XP points teenagers earn.',
        gu: 'કિશોરો મેળવે તેવી ટ્રોફી, મેડલ અને પોઇન્ટ્સ ગોઠવો.',
      },
      addBtn: { en: '+ Add Reward', gu: '+ ઇનામ ઉમેરો' },
    },
    aiPrompts: {
      title: { en: 'AI Helper Quick Question Chips', gu: 'એઆઈ ઝડપી પ્રશ્નો' },
      subtitle: {
        en: '1-tap question buttons and safe pre-written replies for Dr. Jack.',
        gu: 'ડૉ. જેક માટે ૧-ટૅપ પ્રશ્ન બટનો અને સુરક્ષિત જવાબો.',
      },
      addBtn: { en: '+ Add Question', gu: '+ પ્રશ્ન ઉમેરો' },
    },
    users: {
      title: { en: 'App Members & Accounts', gu: 'એપ સભ્યો અને ખાતાઓ' },
      subtitle: {
        en: 'Inspect member heights, grant VIP access, or download/delete data.',
        gu: 'સભ્યોની ઊંચાઈ તપાસો, વીઆઈપી એક્સેસ આપો અથવા ડેટા મેનેજ કરો.',
      },
    },
  },

  topNav: {
    searchPlaceholder: { en: 'Type here to search anything...', gu: 'શોધવા માટે અહીં લખો...' },
    tourBtn: { en: 'Tour', gu: 'માર્ગદર્શન' },
    liveSynced: { en: 'Live Synced', gu: 'લાઈવ જોડાયેલ' },
    signOut: { en: 'Sign Out', gu: 'બહાર નીકળો' },
    addItem: { en: '+ Add New Item', gu: '+ નવી વસ્તુ ઉમેરો' },
  },

  buttons: {
    save: { en: 'Save', gu: 'સાચવો' },
    saveAll: { en: 'Save all', gu: 'બધું સાચવો' },
    cancel: { en: 'Cancel', gu: 'રદ કરો' },
    delete: { en: 'Delete', gu: 'કાઢી નાખો' },
    deleteMember: { en: 'Delete member', gu: 'સભ્ય દૂર કરો' },
    edit: { en: 'Edit', gu: 'સુધારો' },
    refresh: { en: 'Refresh', gu: 'તાજું કરો' },
    downloadTemplate: { en: 'Download template', gu: 'ટેમ્પલેટ ડાઉનલોડ કરો' },
    uploadFile: { en: 'Choose file', gu: 'ફાઈલ પસંદ કરો' },
    grantVip: { en: 'Make VIP Pro', gu: 'વીઆઈપી પ્રો બનાવો' },
    exportData: { en: 'Export data', gu: 'ડેટા ડાઉનલોડ કરો' },
  },

  storageHealth: {
    cardTitle: { en: 'Storage Health', gu: 'સ્ટોરેજ આરોગ્ય' },
    cardSubtitle: {
      en: 'Real-time database and file capacity monitoring.',
      gu: 'ડેટાબેઝ અને ફાઇલોની ક્ષમતાનું લાઈવ મોનિટરિંગ.',
    },
    totalUsers: { en: 'Total Users', gu: 'કુલ સભ્યો' },
    databaseMeter: { en: 'Database', gu: 'ડેટાબેઝ' },
    filesMeter: { en: 'Cloud Files', gu: 'ક્લાઉડ ફાઇલો' },
    freeTierNotice: {
      en: 'Free-tier limits (DB 500 MB, Files 1 GB). Verify in Supabase dashboard.',
      gu: 'ફ્રી લિમિટ (DB 500 MB, ફાઇલ 1 GB). સુપાબેસ ડેશબોર્ડમાં તપાસો.',
    },
    status: {
      ok: { en: 'OK', gu: 'બરાબર છે' },
      checkSoon: { en: 'Check soon', gu: 'ટૂંક સમયમાં તપાસો' },
      upgradeNow: { en: 'Upgrade now', gu: 'હમણાં અપગ્રેડ કરો' },
      loading: { en: 'Checking storage...', gu: 'સ્ટોરેજ તપાસી રહ્યા છીએ...' },
      error: { en: 'Could not check storage', gu: 'સ્ટોરેજ ચકાસી શકાયું નથી' },
    },
  },
} as const
