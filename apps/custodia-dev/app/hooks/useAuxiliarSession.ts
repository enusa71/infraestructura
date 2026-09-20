import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

export function useAuxiliarSession() {
  const { data: session, status } = useSession();
  const [userEmail, setUserEmail] = useState('');
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;

    let email = '';

    // Get current session email (source of truth)
    const currentSessionEmail = session?.user?.email || '';

    // 1. Check localStorage for saved email
    let savedEmail = '';
    try {
      savedEmail = localStorage.getItem('custodia_user_email') || '';
    } catch (err) {
      console.error('Error reading localStorage:', err);
    }

    // 2. Detect user change: if saved email exists but differs from current session
    //    This indicates a different user is now logged in (shared tablets scenario)
    if (savedEmail && currentSessionEmail && savedEmail !== currentSessionEmail) {
      // User changed - clear localStorage to prevent cross-user contamination
      try {
        localStorage.removeItem('custodia_user_email');
      } catch (err) {
        console.error('Error clearing localStorage:', err);
      }
      savedEmail = '';
    }

    // 3. Use saved email if valid, otherwise fall back to current session email
    if (savedEmail && savedEmail !== 'auxiliar_sistema@custodia.local') {
      email = savedEmail;
    } else if (currentSessionEmail) {
      email = currentSessionEmail;
    }

    // 4. Save current email to localStorage for consistency within same user session
    if (email) {
      try {
        localStorage.setItem('custodia_user_email', email);
      } catch (err) {
        console.error('Error writing localStorage:', err);
      }
      setUserEmail(email);
    }

    setLoaded(true);
  }, [session, status]);

  return { userEmail, loaded };
}
