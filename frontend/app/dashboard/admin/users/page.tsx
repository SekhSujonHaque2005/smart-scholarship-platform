'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import DashboardLayout from '@/components/dashboard/DashboardLayout';
import { 
  Search, 
  Filter, 
  MoreVertical, 
  UserPlus, 
  Mail, 
  Shield, 
  UserX, 
  CheckCircle2,
  AlertCircle,
  FileText,
  X
} from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import api from '@/app/lib/api';

export default function UserManagement() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('ALL');
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '', role: 'STUDENT' });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const fetchUsers = async () => {
    try {
      const { data } = await api.get('admin/users');
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchUsers();
  }, []);

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await api.post('admin/users', newUser);
      alert('User created successfully');
      setIsAddUserModalOpen(false);
      setNewUser({ name: '', email: '', password: '', role: 'STUDENT' });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Error creating user');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (userId: string, currentStatus: boolean) => {
    try {
      await api.patch(`admin/users/${userId}/status`, { isActive: !currentStatus });
      setUsers(users.map(u => u.id === userId ? { ...u, isActive: !currentStatus } : u));
    } catch (err) {
      console.error('Error toggling user status:', err);
    }
  };

  const handleResetPassword = async (email: string) => {
    try {
      await api.post('auth/forgot-password', { email });
      alert(`A password reset link has been sent to ${email}`);
    } catch (err) {
      alert('Failed to send reset link.');
    }
    setOpenDropdownId(null);
  };

  const handleViewProfile = (user: any) => {
    setSelectedUser(user);
    setOpenDropdownId(null);
  };

  // Close dropdown if clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!(e.target as Element).closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = filterRole === 'ALL' || user.role === filterRole;
    return matchesSearch && matchesRole;
  });

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-1">
            <h1 className="text-3xl font-black tracking-tighter text-foreground">
              User <span className="text-blue-600 dark:text-blue-500">Directory</span>
            </h1>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">
              Manage permissions and monitor ecosystem health
            </p>
          </div>
          <Button 
            onClick={() => setIsAddUserModalOpen(true)}
            className="rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black uppercase tracking-widest text-[10px] h-12 px-6 gap-2 shadow-xl shadow-blue-600/20"
          >
            <UserPlus size={16} /> Add New User
          </Button>
        </div>

        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row items-center gap-4 bg-card border border-border/50 rounded-3xl p-3 shadow-sm">
           <div className="relative flex-1 w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
              <Input 
                placeholder="Search by name, email, or ID..." 
                className="h-12 pl-12 pr-4 bg-transparent border-none text-foreground placeholder:text-muted-foreground focus-visible:ring-0 focus-visible:ring-offset-0 text-sm font-medium"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
           </div>
           <div className="flex items-center gap-2 p-1 bg-muted/30 rounded-2xl w-full md:w-auto">
              {['ALL', 'STUDENT', 'PROVIDER', 'ADMIN'].map((role) => (
                <button
                  key={role}
                  onClick={() => setFilterRole(role)}
                  className={cn(
                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                    filterRole === role ? "bg-card text-foreground shadow-sm ring-1 ring-border/50" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {role}
                </button>
              ))}
           </div>
        </div>

        {/* Users Table */}
        <div className="rounded-[2.5rem] bg-card border border-border/50 shadow-sm overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                 <thead>
                    <tr className="bg-muted/30 border-b border-border/50">
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">User Entity</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Classification</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Ecosystem Status</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground">Registration</th>
                       <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-muted-foreground text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-border/50">
                    {filteredUsers.map((user, idx) => (
                      <motion.tr 
                        key={user.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.05 }}
                        className="hover:bg-muted/20 transition-colors group"
                      >
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-4">
                               <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-600 font-black text-lg border border-blue-500/10">
                                  {user.student?.name?.[0] || user.provider?.orgName?.[0] || 'U'}
                               </div>
                               <div>
                                  <h4 className="text-sm font-black text-foreground group-hover:text-blue-600 transition-colors">
                                    {user.student?.name || user.provider?.orgName || 'User'}
                                  </h4>
                                  <div className="flex items-center gap-1.5 mt-0.5 opacity-60">
                                     <Mail size={12} />
                                     <span className="text-[10px] font-bold">{user.email}</span>
                                  </div>
                               </div>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <div className="flex items-center gap-2">
                               <div className={cn(
                                 "p-1.5 rounded-lg",
                                 user.role === 'STUDENT' ? "bg-blue-500/10 text-blue-600" : "bg-purple-500/10 text-purple-600"
                               )}>
                                  {user.role === 'STUDENT' ? <Shield size={14} /> : <FileText size={14} />}
                               </div>
                               <span className="text-xs font-black uppercase tracking-tighter">{user.role}</span>
                            </div>
                         </td>
                         <td className="px-8 py-6">
                            <button 
                              onClick={() => handleToggleStatus(user.id, user.isActive)}
                              className={cn(
                               "inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                               user.isActive ? "bg-emerald-500/10 text-emerald-500 hover:bg-rose-500/10 hover:text-rose-500" : "bg-rose-500/10 text-rose-500 hover:bg-emerald-500/10 hover:text-emerald-500"
                            )}>
                               {user.isActive ? <CheckCircle2 size={12} /> : <UserX size={12} />}
                               {user.isActive ? 'Active' : 'Blocked'}
                            </button>
                         </td>
                         <td className="px-8 py-6 text-xs font-bold text-muted-foreground">
                            {new Date(user.createdAt).toLocaleDateString()}
                         </td>
                         <td className="px-8 py-6 text-right relative dropdown-container">
                            <button 
                              onClick={() => setOpenDropdownId(openDropdownId === user.id ? null : user.id)}
                              className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-foreground transition-all"
                            >
                               <MoreVertical size={18} />
                            </button>
                            
                            {openDropdownId === user.id && (
                              <div className="absolute right-8 top-12 z-10 w-48 bg-card border border-border/50 rounded-xl shadow-xl overflow-hidden py-1 animate-in fade-in zoom-in-95">
                                 <button 
                                   onClick={() => handleViewProfile(user)}
                                   className="w-full text-left px-4 py-2 text-xs font-bold text-foreground hover:bg-muted/50 transition-colors"
                                 >
                                   View Full Profile
                                 </button>
                                 <button 
                                   onClick={() => handleResetPassword(user.email)}
                                   className="w-full text-left px-4 py-2 text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors"
                                 >
                                   Send Reset Password
                                 </button>
                              </div>
                            )}
                         </td>
                      </motion.tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>

      </div>

      {/* Add User Modal */}
      {isAddUserModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between">
               <h3 className="text-lg font-black tracking-tight">Add New User</h3>
               <button onClick={() => setIsAddUserModalOpen(false)} className="text-muted-foreground hover:text-foreground">
                 <X size={20} />
               </button>
            </div>
            <form onSubmit={handleCreateUser} className="p-6 space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Full Name / Org Name</label>
                <Input required value={newUser.name} onChange={(e) => setNewUser({...newUser, name: e.target.value})} placeholder="Enter name" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Email Address</label>
                <Input required type="email" value={newUser.email} onChange={(e) => setNewUser({...newUser, email: e.target.value})} placeholder="user@example.com" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Temporary Password</label>
                <Input required type="password" value={newUser.password} onChange={(e) => setNewUser({...newUser, password: e.target.value})} placeholder="••••••••" className="h-12 rounded-xl" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account Type</label>
                <select 
                  className="w-full h-12 px-4 rounded-xl border border-border/50 bg-background text-sm font-medium focus:ring-2 focus:ring-blue-500/20"
                  value={newUser.role}
                  onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                >
                  <option value="STUDENT">Student</option>
                  <option value="PROVIDER">Provider</option>
                  <option value="ADMIN">Administrator</option>
                </select>
              </div>
              <div className="pt-4 flex items-center justify-end gap-3">
                 <Button type="button" variant="ghost" onClick={() => setIsAddUserModalOpen(false)} className="rounded-xl">Cancel</Button>
                 <Button type="submit" disabled={isSubmitting} className="rounded-xl bg-blue-600 hover:bg-blue-700 text-white px-6">
                   {isSubmitting ? 'Creating...' : 'Create User'}
                 </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* View Profile Modal */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-lg bg-card border border-border/50 rounded-3xl shadow-xl overflow-hidden"
          >
            <div className="p-6 border-b border-border/50 flex items-center justify-between bg-muted/20">
               <div className="flex items-center gap-4">
                 <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 flex items-center justify-center text-blue-600 font-black text-xl border border-blue-500/10 shrink-0">
                    {selectedUser.student?.name?.[0] || selectedUser.provider?.orgName?.[0] || 'U'}
                 </div>
                 <div>
                    <h3 className="text-xl font-black tracking-tight">{selectedUser.student?.name || selectedUser.provider?.orgName || 'User Profile'}</h3>
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{selectedUser.role}</p>
                 </div>
               </div>
               <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
                 <X size={20} />
               </button>
            </div>
            <div className="p-6 space-y-6">
               <div className="grid grid-cols-2 gap-4">
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Email Address</p>
                   <p className="text-sm font-bold">{selectedUser.email}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Account Status</p>
                   <p className={cn("text-sm font-bold", selectedUser.isActive ? "text-emerald-500" : "text-rose-500")}>
                     {selectedUser.isActive ? 'Active' : 'Suspended'}
                   </p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Joined Date</p>
                   <p className="text-sm font-bold">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                 </div>
                 <div className="space-y-1">
                   <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">System ID</p>
                   <p className="text-xs font-mono text-muted-foreground bg-muted/50 p-1 rounded inline-block">{selectedUser.id}</p>
                 </div>
               </div>

               {selectedUser.role === 'STUDENT' && selectedUser.student && (
                 <div className="pt-4 border-t border-border/50 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-blue-500">Student Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Field of Study</p>
                        <p className="text-sm font-medium">{selectedUser.student.fieldOfStudy || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">CGPA</p>
                        <p className="text-sm font-medium">{selectedUser.student.cgpa || 'N/A'}</p>
                      </div>
                    </div>
                 </div>
               )}

               {selectedUser.role === 'PROVIDER' && selectedUser.provider && (
                 <div className="pt-4 border-t border-border/50 space-y-4">
                    <h4 className="text-xs font-black uppercase tracking-widest text-purple-500">Provider Details</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Organization Type</p>
                        <p className="text-sm font-medium">{selectedUser.provider.orgType || 'Not provided'}</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">Trust Score</p>
                        <p className="text-sm font-medium">{selectedUser.provider.trustScore}/100</p>
                      </div>
                    </div>
                 </div>
               )}

               <div className="pt-4 flex items-center justify-end">
                  <Button type="button" variant="ghost" onClick={() => setSelectedUser(null)} className="rounded-xl">Close</Button>
               </div>
            </div>
          </motion.div>
        </div>
      )}

    </DashboardLayout>
  );
}
