import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../../components/ui/Tabs';
import FeeGroupsTab from './components/FeeGroupsTab';
import MembersTab from './components/MembersTab';
import { Users, DollarSign } from 'lucide-react';

export default function MembersManagement() {
  const [activeTab, setActiveTab] = useState('members');

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white mb-2">Members & Fees Management</h2>
        <p className="text-gray-400">Kelola member JKT48 dan paket harga video call</p>
      </div>

      {/* Panel feel */}
      <div className="bg-[#12161F] border border-gray-800 rounded-2xl overflow-hidden">
        <div className="p-4 md:p-6 space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            {/* Tabs header */}
            <TabsList className="bg-[#0A0E17] border border-gray-800 rounded-xl p-1" >
              <TabsTrigger
                value="members"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-200 rounded-lg"
              >
                <Users className="w-4 h-4 mr-2" />
                Members
              </TabsTrigger>

              <TabsTrigger
                value="fee-groups"
                className="data-[state=active]:bg-amber-500 data-[state=active]:text-black text-gray-200 rounded-lg"
              >
                <DollarSign className="w-4 h-4 mr-2" />
                Fee Groups
              </TabsTrigger>
            </TabsList>

            <TabsContent value="members" className="mt-4">
              <MembersTab />
            </TabsContent>

            <TabsContent value="fee-groups" className="mt-4">
              <FeeGroupsTab />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
