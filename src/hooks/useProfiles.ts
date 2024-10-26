import { useState, useEffect } from 'react';

export interface Profile {
  id: number;
  name: string;
  age: number;
  roles: string[];
}

export const useProfiles = () => {
  const [profiles, setProfiles] = useState<Profile[]>([]);

  useEffect(() => {
    const storedProfiles = localStorage.getItem('profiles');
    if (storedProfiles) {
      setProfiles(JSON.parse(storedProfiles));
    }
  }, []);

  const updateProfiles = (newProfiles: Profile[]) => {
    setProfiles(newProfiles);
    localStorage.setItem('profiles', JSON.stringify(newProfiles));
  };

  return { profiles, updateProfiles };
};