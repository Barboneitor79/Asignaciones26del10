import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './components/ui/tabs';
import ProfilesTab from './components/ProfilesTab';
import AssignmentsTab from './components/AssignmentsTab';

function App() {
  const [activeTab, setActiveTab] = useState('profiles');

  return (
    <div className="min-h-screen bg-gray-100 p-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Asignaciones para Reuniones</h1>
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8">
          <TabsTrigger value="profiles">Perfiles</TabsTrigger>
          <TabsTrigger value="assignments">Asignaciones</TabsTrigger>
        </TabsList>
        <TabsContent value="profiles">
          <ProfilesTab />
        </TabsContent>
        <TabsContent value="assignments">
          <AssignmentsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export default App;