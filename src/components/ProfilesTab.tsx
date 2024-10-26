import React, { useState } from 'react';
import { Plus, Edit, Trash2, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Checkbox } from './ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './ui/dialog';
import { useProfiles, Profile } from '../hooks/useProfiles';

const roles = ['Microfono', 'Audio', 'Video', 'Plataforma', 'Acomodador'];

const ProfilesTab: React.FC = () => {
  const { profiles, updateProfiles } = useProfiles();
  const [newName, setNewName] = useState('');
  const [newAge, setNewAge] = useState('');
  const [newRoles, setNewRoles] = useState<string[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);
  const [showErrorDialog, setShowErrorDialog] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showEditDialog, setShowEditDialog] = useState(false);

  const validateCSV = (content: string): { isValid: boolean; profiles?: Profile[] } => {
    const lines = content.split('\n').filter(line => line.trim());
    if (lines.length < 2) {
      return { isValid: false };
    }

    const header = lines[0].toLowerCase().trim();
    const expectedHeader = 'nombre,edad,roles';
    if (header !== expectedHeader) {
      return { isValid: false };
    }

    const profiles: Profile[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const [name, age, rolesList] = line.split(',').map(item => item.trim());
      const parsedAge = parseInt(age);
      const parsedRoles = rolesList.split(';').map(role => role.trim());

      if (!name || isNaN(parsedAge) || parsedRoles.length === 0) {
        return { isValid: false };
      }

      const invalidRoles = parsedRoles.filter(role => !roles.includes(role));
      if (invalidRoles.length > 0) {
        return { isValid: false };
      }

      profiles.push({
        id: Date.now() + i,
        name,
        age: parsedAge,
        roles: parsedRoles
      });
    }

    return { isValid: true, profiles };
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const validation = validateCSV(content);

      if (validation.isValid && validation.profiles) {
        const newProfiles = [...profiles, ...validation.profiles];
        updateProfiles(newProfiles);
        setShowSuccessDialog(true);
      } else {
        setErrorMessage(`El formato del archivo CSV es incorrecto. 
          Por favor, use el siguiente formato:
          
          nombre,edad,roles
          Juan Pérez,25,Microfono;Audio
          María García,30,Video;Plataforma
          
          Notas:
          - La primera línea debe ser el encabezado exacto: nombre,edad,roles
          - Los roles deben estar separados por punto y coma (;)
          - Los roles válidos son: ${roles.join(', ')}
          - Cada línea debe tener todos los campos completos`);
        setShowErrorDialog(true);
      }
    };
    reader.readAsText(file);
    event.target.value = '';
  };

  const handleAddProfile = () => {
    if (newName && newAge && newRoles.length > 0) {
      const newProfile: Profile = {
        id: Date.now(),
        name: newName,
        age: parseInt(newAge),
        roles: newRoles
      };
      const updatedProfiles = [...profiles, newProfile];
      updateProfiles(updatedProfiles);
      resetForm();
    }
  };

  const handleEditProfile = (profile: Profile) => {
    setEditingId(profile.id);
    setNewName(profile.name);
    setNewAge(profile.age.toString());
    setNewRoles(profile.roles);
    setShowEditDialog(true);
  };

  const handleUpdateProfile = () => {
    if (editingId && newName && newAge && newRoles.length > 0) {
      const updatedProfiles = profiles.map(profile =>
        profile.id === editingId
          ? { ...profile, name: newName, age: parseInt(newAge), roles: newRoles }
          : profile
      );
      updateProfiles(updatedProfiles);
      resetForm();
      setShowEditDialog(false);
    }
  };

  const handleDeleteProfile = (id: number) => {
    const updatedProfiles = profiles.filter(profile => profile.id !== id);
    updateProfiles(updatedProfiles);
  };

  const resetForm = () => {
    setNewName('');
    setNewAge('');
    setNewRoles([]);
    setEditingId(null);
  };

  const handleRoleToggle = (role: string) => {
    setNewRoles(prev =>
      prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]
    );
  };

  const handleCancelEdit = () => {
    resetForm();
    setShowEditDialog(false);
  };

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Perfiles</h2>
      <div className="mb-4">
        <Input
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
          id="csv-upload"
        />
        <label htmlFor="csv-upload">
          <Button variant="outline" className="mb-4 w-full" asChild>
            <span>
              <Upload className="mr-2 h-4 w-4" /> Importar desde CSV
            </span>
          </Button>
        </label>
      </div>
      <div className="mb-4 space-y-2">
        <Input
          type="text"
          placeholder="Nombre del perfil"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="w-full"
        />
        <Input
          type="number"
          placeholder="Edad"
          value={newAge}
          onChange={(e) => setNewAge(e.target.value)}
          className="w-full"
        />
        <div className="space-y-2">
          {roles.map((role) => (
            <div key={role} className="flex items-center space-x-2">
              <Checkbox
                id={role}
                checked={newRoles.includes(role)}
                onCheckedChange={() => handleRoleToggle(role)}
              />
              <label htmlFor={role} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                {role}
              </label>
            </div>
          ))}
        </div>
        <Button onClick={handleAddProfile} className="w-full">
          <Plus className="mr-2 h-4 w-4" /> Agregar Perfil
        </Button>
      </div>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <div key={profile.id} className="bg-white p-4 rounded-lg shadow flex justify-between items-center">
            <div>
              <h3 className="text-lg font-semibold">{profile.name} ({profile.age} años)</h3>
              <p className="text-sm text-gray-600">Roles: {profile.roles.join(', ')}</p>
            </div>
            <div className="space-x-2">
              <Button variant="outline" size="sm" onClick={() => handleEditProfile(profile)}>
                <Edit className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={() => handleDeleteProfile(profile.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¡Importación Exitosa!</DialogTitle>
            <DialogDescription>
              Los perfiles han sido importados correctamente desde el archivo CSV.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showErrorDialog} onOpenChange={setShowErrorDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Error de Formato</DialogTitle>
            <DialogDescription className="whitespace-pre-line">
              {errorMessage}
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>

      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Perfil</DialogTitle>
            <DialogDescription>
              Modifica los datos del perfil
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              type="text"
              placeholder="Nombre del perfil"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              className="w-full"
            />
            <Input
              type="number"
              placeholder="Edad"
              value={newAge}
              onChange={(e) => setNewAge(e.target.value)}
              className="w-full"
            />
            <div className="space-y-2">
              {roles.map((role) => (
                <div key={role} className="flex items-center space-x-2">
                  <Checkbox
                    id={`edit-${role}`}
                    checked={newRoles.includes(role)}
                    onCheckedChange={() => handleRoleToggle(role)}
                  />
                  <label htmlFor={`edit-${role}`} className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                    {role}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <DialogFooter className="flex justify-between sm:justify-between">
            <Button
              type="button"
              variant="destructive"
              onClick={handleCancelEdit}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-sky-500 hover:bg-sky-600"
              onClick={handleUpdateProfile}
            >
              Actualizar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ProfilesTab;