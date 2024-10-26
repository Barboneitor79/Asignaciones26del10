import React, { useState, useEffect } from 'react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { useProfiles, Profile } from '../hooks/useProfiles';

const roles = ['Microfono', 'Audio', 'Video', 'Plataforma', 'Acomodador'];

const AssignmentsTab: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(
    new Date().toISOString().slice(0, 7)
  );
  const [meetings, setMeetings] = useState<Date[]>([]);
  const { profiles } = useProfiles();
  const [assignments, setAssignments] = useState<
    Record<string, Record<string, string>>
  >({});

  useEffect(() => {
    const generateMeetings = () => {
      const [year, month] = selectedMonth.split('-').map(Number);
      const firstDay = new Date(year, month - 1, 1);
      const lastDay = new Date(year, month, 0);
      const meetingDates: Date[] = [];

      for (
        let d = new Date(firstDay);
        d <= lastDay;
        d.setDate(d.getDate() + 1)
      ) {
        if (d.getDay() === 4 || d.getDay() === 6) {
          // 4 is Thursday, 6 is Saturday
          meetingDates.push(new Date(d));
        }
      }

      setMeetings(meetingDates);
      generateDefaultAssignments(meetingDates);
    };

    generateMeetings();
  }, [selectedMonth, profiles]);

  const generateDefaultAssignments = (meetingDates: Date[]) => {
    const newAssignments: Record<string, Record<string, string>> = {};

    meetingDates.forEach((date) => {
      const dateString = date.toISOString().split('T')[0];
      newAssignments[dateString] = {};

      roles.forEach((role) => {
        const availableProfiles = getAvailableProfiles(
          dateString,
          role,
          newAssignments
        );
        if (availableProfiles.length > 0) {
          const selectedProfile =
            availableProfiles[
              Math.floor(Math.random() * availableProfiles.length)
            ];
          newAssignments[dateString][role] = selectedProfile.id.toString();
        }
      });
    });

    setAssignments(newAssignments);
  };

  const getAvailableProfiles = (
    date: string,
    role: string,
    currentAssignments: Record<string, Record<string, string>>
  ) => {
    return profiles.filter((profile) => {
      const isQualified = profile.roles.includes(role);
      const isAvailableOnDate = !Object.values(
        currentAssignments[date] || {}
      ).includes(profile.id.toString());
      const isAgeAppropriate = checkAgeAppropriate(
        date,
        role,
        profile,
        currentAssignments
      );
      return isQualified && isAvailableOnDate && isAgeAppropriate;
    });
  };

  const checkAgeAppropriate = (
    date: string,
    role: string,
    profile: Profile,
    currentAssignments: Record<string, Record<string, string>>
  ) => {
    if (role !== 'Audio' && role !== 'Video') return true;
    const otherRole = role === 'Audio' ? 'Video' : 'Audio';
    const otherAssignedId = currentAssignments[date]?.[otherRole];
    if (!otherAssignedId) return true;
    const otherProfile = profiles.find(
      (p) => p.id.toString() === otherAssignedId
    );
    if (!otherProfile) return true;
    if (profile.age < 18 && otherProfile.age < 18) return false;
    return true;
  };

  const assignPerson = (date: string, role: string, personId: string) => {
    setAssignments((prev) => {
      const newAssignments = { ...prev };
      if (!newAssignments[date]) {
        newAssignments[date] = {};
      }
      newAssignments[date][role] = personId;
      return newAssignments;
    });
  };

  const getAssignedProfileName = (date: string, role: string) => {
    const assignedId = assignments[date]?.[role];
    if (assignedId) {
      const profile = profiles.find((p) => p.id.toString() === assignedId);
      return profile ? `${profile.name}` : 'Asignar';
    }
    return 'Asignar';
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Asignaciones</h2>
      <Select value={selectedMonth} onValueChange={setSelectedMonth}>
        <SelectTrigger className="w-[180px] mb-4">
          <SelectValue placeholder="Selecciona un mes" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 12 }, (_, i) => {
            const date = new Date(new Date().getFullYear(), i, 1);
            return (
              <SelectItem key={i} value={date.toISOString().slice(0, 7)}>
                {date.toLocaleString('default', {
                  month: 'long',
                  year: 'numeric',
                })}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border p-2">Fecha</th>
              {roles.map((role) => (
                <th key={role} className="border p-2">
                  {role}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {meetings.map((date) => {
              const dateString = date.toISOString().split('T')[0];
              return (
                <tr key={dateString}>
                  <td className="border p-2">
                    {date.toLocaleDateString('es-ES', {
                      day: '2-digit',
                      month: '2-digit',
                      year: 'numeric',
                    })}
                  </td>

                  {roles.map((role) => (
                    <td key={role} className="border p-2">
                      <Select
                        value={assignments[dateString]?.[role] || ''}
                        onValueChange={(value) =>
                          assignPerson(dateString, role, value)
                        }
                      >
                        <SelectTrigger className="w-full bg-white">
                          <SelectValue>
                            {getAssignedProfileName(dateString, role)}
                          </SelectValue>
                        </SelectTrigger>
                        <SelectContent>
                          {getAvailableProfiles(
                            dateString,
                            role,
                            assignments
                          ).map((profile) => (
                            <SelectItem
                              key={profile.id}
                              value={profile.id.toString()}
                            >
                              {profile.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AssignmentsTab;
