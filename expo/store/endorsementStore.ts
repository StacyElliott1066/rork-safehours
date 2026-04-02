import { useState, useEffect, useCallback, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import createContextHook from '@nkzw/create-context-hook';
import {
  FlightEndorsement,
  WrittenPracticalTest,
} from '@/types/endorsement';

const ENDORSEMENTS_KEY = 'flight-endorsements';
const TESTS_KEY = 'written-practical-tests';

export const [EndorsementProvider, useEndorsementStore] = createContextHook(() => {
  const [flightEndorsements, setFlightEndorsements] = useState<FlightEndorsement[]>([]);
  const [writtenPracticalTests, setWrittenPracticalTests] = useState<WrittenPracticalTest[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [endorsementsRaw, testsRaw] = await Promise.all([
          AsyncStorage.getItem(ENDORSEMENTS_KEY),
          AsyncStorage.getItem(TESTS_KEY),
        ]);
        if (endorsementsRaw) {
          setFlightEndorsements(JSON.parse(endorsementsRaw));
        }
        if (testsRaw) {
          setWrittenPracticalTests(JSON.parse(testsRaw));
        }
      } catch (e) {
        console.error('Failed to load endorsement data:', e);
      } finally {
        setLoaded(true);
      }
    };
    void loadData();
  }, []);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(ENDORSEMENTS_KEY, JSON.stringify(flightEndorsements)).catch((e) =>
      console.error('Failed to save endorsements:', e)
    );
  }, [flightEndorsements, loaded]);

  useEffect(() => {
    if (!loaded) return;
    AsyncStorage.setItem(TESTS_KEY, JSON.stringify(writtenPracticalTests)).catch((e) =>
      console.error('Failed to save tests:', e)
    );
  }, [writtenPracticalTests, loaded]);

  const addFlightEndorsement = useCallback(
    (data: Omit<FlightEndorsement, 'id' | 'createdAt'>) => {
      const newItem: FlightEndorsement = {
        ...data,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      setFlightEndorsements((prev) => [...prev, newItem]);
    },
    []
  );

  const updateFlightEndorsement = useCallback(
    (id: string, updates: Partial<FlightEndorsement>) => {
      setFlightEndorsements((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const deleteFlightEndorsement = useCallback((id: string) => {
    setFlightEndorsements((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const addWrittenPracticalTest = useCallback(
    (data: Omit<WrittenPracticalTest, 'id' | 'createdAt'>) => {
      const newItem: WrittenPracticalTest = {
        ...data,
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        createdAt: Date.now(),
      };
      setWrittenPracticalTests((prev) => [...prev, newItem]);
    },
    []
  );

  const updateWrittenPracticalTest = useCallback(
    (id: string, updates: Partial<WrittenPracticalTest>) => {
      setWrittenPracticalTests((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...updates } : item))
      );
    },
    []
  );

  const deleteWrittenPracticalTest = useCallback((id: string) => {
    setWrittenPracticalTests((prev) => prev.filter((item) => item.id !== id));
  }, []);

  const importWrittenPracticalTests = useCallback((tests: WrittenPracticalTest[]) => {
    setWrittenPracticalTests(tests);
  }, []);

  const getWrittenStats = useCallback(() => {
    const written = writtenPracticalTests.filter((t) => t.category === 'Written');
    const total = written.length;
    const passed = written.filter((t) => t.result === 'Pass').length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, passRate };
  }, [writtenPracticalTests]);

  const getPracticalStats = useCallback(() => {
    const practical = writtenPracticalTests.filter((t) => t.category === 'Practical');
    const total = practical.length;
    const passed = practical.filter((t) => t.result === 'Pass').length;
    const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
    return { total, passRate };
  }, [writtenPracticalTests]);

  const getAllNames = useCallback(() => {
    const endorsementNames = flightEndorsements
      .map((e) => e.name)
      .filter((n): n is string => !!n);
    const testNames = writtenPracticalTests.map((t) => t.studentName);
    const allNames = [...new Set([...endorsementNames, ...testNames])];
    return allNames.sort();
  }, [flightEndorsements, writtenPracticalTests]);

  return useMemo(
    () => ({
      flightEndorsements,
      writtenPracticalTests,
      addFlightEndorsement,
      updateFlightEndorsement,
      deleteFlightEndorsement,
      addWrittenPracticalTest,
      updateWrittenPracticalTest,
      deleteWrittenPracticalTest,
      importWrittenPracticalTests,
      getWrittenStats,
      getPracticalStats,
      getAllNames,
      loaded,
    }),
    [
      flightEndorsements,
      writtenPracticalTests,
      addFlightEndorsement,
      updateFlightEndorsement,
      deleteFlightEndorsement,
      addWrittenPracticalTest,
      updateWrittenPracticalTest,
      deleteWrittenPracticalTest,
      importWrittenPracticalTests,
      getWrittenStats,
      getPracticalStats,
      getAllNames,
      loaded,
    ]
  );
});
