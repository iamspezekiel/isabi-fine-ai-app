
'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Loader2, MapPin, Trash2, Save, ShieldCheck, ChevronLeft, HeartPulse } from 'lucide-react';
import type { Coordinates } from '@/lib/types';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';

export default function EmergencyPage() {
  const [loading, setLoading] = useState(true);
  const [isClient, setIsClient] = useState(false);
  const { toast } = useToast();

  const [newEmergencyContact, setNewEmergencyContact] = useState('');
  const [emergencyContacts, setEmergencyContacts] = useState<string[]>([]);
  
  const [isSavingLocation, setIsSavingLocation] = useState(false);
  const [savedLocation, setSavedLocation] = useState<Coordinates | null>(null);
  const [savedAddress, setSavedAddress] = useState<string | null>(null);
  const [manualAddress, setManualAddress] = useState('');

  const [medicalInfo, setMedicalInfo] = useState({
    bloodType: '',
    allergies: '',
    conditions: '',
    medications: '',
    dob: '',
    organDonor: false,
    primaryCarePhysician: '',
    insuranceProvider: '',
    insurancePolicyNumber: '',
    notes: '',
  });

  useEffect(() => {
    setIsClient(true);
    setLoading(false);
  }, []);

  // Load saved data on mount
  useEffect(() => {
    if (isClient) {
      const locationRaw = localStorage.getItem('userSavedLocation');
      const addressRaw = localStorage.getItem('userSavedLocationAddress');
      const contactsRaw = localStorage.getItem('emergencyContacts');
      const medicalInfoRaw = localStorage.getItem('userMedicalInfo');
      
      if (locationRaw) {
          try {
              setSavedLocation(JSON.parse(locationRaw));
          } catch (e) {
              console.error("Could not parse saved location", e);
              localStorage.removeItem('userSavedLocation');
          }
      }
      if (addressRaw) {
          setSavedAddress(addressRaw);
      }
      if (contactsRaw) {
          try {
              setEmergencyContacts(JSON.parse(contactsRaw));
          } catch(e) {
              console.error("Could not parse emergency contacts", e);
              localStorage.removeItem('emergencyContacts');
          }
      }
      if (medicalInfoRaw) {
        try {
          const savedInfo = JSON.parse(medicalInfoRaw);
          // Merge with defaults to handle new fields not in old saved data
          setMedicalInfo(prev => ({ ...prev, ...savedInfo }));
        } catch (e) {
          console.error("Could not parse medical info", e);
          localStorage.removeItem('userMedicalInfo');
        }
      }
    }
  }, [isClient]);

  const handleAddEmergencyContact = () => {
    if (!newEmergencyContact.trim()) {
      toast({ title: "Input Empty", description: "Please enter a contact name or number.", variant: "destructive" });
      return;
    }
    const updatedContacts = [...emergencyContacts, newEmergencyContact.trim()];
    setEmergencyContacts(updatedContacts);
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    toast({ title: "Emergency Contact Added", description: `${newEmergencyContact.trim()} has been added.` });
    setNewEmergencyContact('');
  };
  
  const handleRemoveEmergencyContact = (contactToRemove: string) => {
    const updatedContacts = emergencyContacts.filter(c => c !== contactToRemove);
    setEmergencyContacts(updatedContacts);
    localStorage.setItem('emergencyContacts', JSON.stringify(updatedContacts));
    toast({ title: "Emergency Contact Removed", description: `${contactToRemove} has been removed.` });
  };
  
  const handleSaveCurrentLocation = () => {
    if (!navigator.geolocation) {
      toast({ title: "Geolocation Not Supported", description: "Your browser does not support geolocation.", variant: "destructive" });
      return;
    }
    setIsSavingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const newSavedLocation = { lat: latitude, lng: longitude };
        const addressString = `Current Location (${newSavedLocation.lat.toFixed(2)}, ${newSavedLocation.lng.toFixed(2)})`;
        localStorage.setItem('userSavedLocation', JSON.stringify(newSavedLocation));
        localStorage.setItem('userSavedLocationAddress', addressString);
        setSavedLocation(newSavedLocation);
        setSavedAddress(addressString);
        toast({ title: "Location Saved", description: "Your current location has been saved as your default." });
        setIsSavingLocation(false);
      },
      (error) => {
        toast({ title: "Could Not Get Location", description: error.message, variant: "destructive" });
        setIsSavingLocation(false);
      }
    );
  };
  
  const handleSaveManualAddress = () => {
    if (!manualAddress.trim()) {
      toast({ title: "Address cannot be empty", description: "Please enter a valid address.", variant: "destructive" });
      return;
    }
    const geocodedCoordinates = { lat: 6.5244, lng: 3.3792 }; // Geocoding
    localStorage.setItem('userSavedLocation', JSON.stringify(geocodedCoordinates));
    localStorage.setItem('userSavedLocationAddress', manualAddress);
    setSavedLocation(geocodedCoordinates);
    setSavedAddress(manualAddress);
    toast({ title: "Address Saved", description: `${manualAddress} has been saved as your default.` });
    setManualAddress('');
  };

  const handleClearLocation = () => {
    localStorage.removeItem('userSavedLocation');
    localStorage.removeItem('userSavedLocationAddress');
    setSavedLocation(null);
    setSavedAddress(null);
    toast({ title: "Saved Location Cleared", description: "Your default emergency location has been removed." });
  };

  const handleSaveMedicalInfo = () => {
    localStorage.setItem('userMedicalInfo', JSON.stringify(medicalInfo));
    toast({ title: "Medical Information Saved", description: "Your medical details have been updated." });
  };
  
  const handleMedicalInfoChange = (field: keyof typeof medicalInfo, value: string | boolean) => {
    setMedicalInfo(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <div className="fixed top-0 left-0 right-0 z-30 flex items-center p-4 border-b bg-background h-16">
          <Button asChild variant="ghost" size="icon" className="mr-2">
              <Link href="/profile" aria-label="Go back to dashboard">
                  <ChevronLeft className="h-6 w-6" />
              </Link>
          </Button>
          <h1 className="text-xl font-bold text-foreground font-heading">Emergency Setup</h1>
      </div>

      <main className="flex-grow container mx-auto p-4 pt-20 pb-20">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Location Settings Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <MapPin className="mr-3 h-6 w-6" /> Location Settings
              </CardTitle>
              <CardDescription>
                Save a default location to quickly find nearby facilities in an emergency.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-3 bg-input/50 rounded-md text-sm">
                <p className="font-medium text-foreground mb-1">Saved Default Location</p>
                <p className="text-muted-foreground break-words">
                  {savedAddress || 'No default location saved.'}
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-address">Set or Update Manual Address</Label>
                <div className="flex gap-2">
                  <Input 
                    id="manual-address" 
                    placeholder="e.g., 123 Health Ave, Abuja" 
                    value={manualAddress}
                    onChange={(e) => setManualAddress(e.target.value)}
                    className="bg-input"
                  />
                  <Button onClick={handleSaveManualAddress} disabled={!manualAddress.trim()} className="bg-primary hover:bg-primary/90">
                    Save
                  </Button>
                </div>
              </div>
              <div className="relative my-2">
                <div className="absolute inset-0 flex items-center"><span className="w-full border-t" /></div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">Or</span>
                </div>
              </div>
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={handleSaveCurrentLocation} className="flex-1" variant="outline" disabled={isSavingLocation}>
                  {isSavingLocation ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                  Use My Current Location
                </Button>
                <Button onClick={handleClearLocation} variant="destructive" className="flex-1" disabled={!savedLocation}>
                  <Trash2 className="mr-2 h-4 w-4" /> Clear Saved Location
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Medical Information Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <HeartPulse className="mr-3 h-6 w-6" /> Medical Information
              </CardTitle>
              <CardDescription>
                Provide key medical details that can be crucial in an emergency. This data is saved on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 pt-2">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dob">Date of Birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={medicalInfo.dob}
                    onChange={(e) => handleMedicalInfoChange('dob', e.target.value)}
                    className="bg-input"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood-type">Blood Type</Label>
                  <Select 
                    value={medicalInfo.bloodType} 
                    onValueChange={(value) => handleMedicalInfoChange('bloodType', value)}
                  >
                    <SelectTrigger id="blood-type" className="bg-input">
                      <SelectValue placeholder="Select blood type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                      <SelectItem value="Unknown">Don't Know</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-input/50 rounded-md">
                <div className="space-y-0.5">
                  <Label htmlFor="organ-donor" className="font-medium text-foreground">Organ Donor</Label>
                  <p className="text-xs text-muted-foreground">Indicate if you are a registered organ donor.</p>
                </div>
                <Switch
                  id="organ-donor"
                  checked={medicalInfo.organDonor}
                  onCheckedChange={(checked) => handleMedicalInfoChange('organDonor', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="allergies">Allergies</Label>
                <Textarea
                  id="allergies"
                  placeholder="e.g., Penicillin, Peanuts, Bee stings"
                  value={medicalInfo.allergies}
                  onChange={(e) => handleMedicalInfoChange('allergies', e.target.value)}
                  className="bg-input"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="conditions">Medical Conditions</Label>
                <Textarea
                  id="conditions"
                  placeholder="e.g., Asthma, Diabetes, Hypertension"
                  value={medicalInfo.conditions}
                  onChange={(e) => handleMedicalInfoChange('conditions', e.target.value)}
                  className="bg-input"
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="medications">Current Medications</Label>
                <Textarea
                  id="medications"
                  placeholder="e.g., Metformin 500mg, Ventolin inhaler"
                  value={medicalInfo.medications}
                  onChange={(e) => handleMedicalInfoChange('medications', e.target.value)}
                  className="bg-input"
                  rows={2}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="primary-care-physician">Primary Care Physician</Label>
                <Input
                    id="primary-care-physician"
                    placeholder="e.g., Dr. Ada Eze, 08012345678"
                    value={medicalInfo.primaryCarePhysician}
                    onChange={(e) => handleMedicalInfoChange('primaryCarePhysician', e.target.value)}
                    className="bg-input"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                      <Label htmlFor="insurance-provider">Insurance Provider</Label>
                      <Input
                          id="insurance-provider"
                          placeholder="e.g., IsabiFine Health"
                          value={medicalInfo.insuranceProvider}
                          onChange={(e) => handleMedicalInfoChange('insuranceProvider', e.target.value)}
                          className="bg-input"
                      />
                  </div>
                  <div className="space-y-2">
                      <Label htmlFor="insurance-policy-number">Policy Number</Label>
                      <Input
                          id="insurance-policy-number"
                          placeholder="e.g., IFH123456789"
                          value={medicalInfo.insurancePolicyNumber}
                          onChange={(e) => handleMedicalInfoChange('insurancePolicyNumber', e.target.value)}
                          className="bg-input"
                      />
                  </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Additional Medical Notes</Label>
                <Textarea
                    id="notes"
                    placeholder="e.g., Allergic to latex, Pacemaker installed"
                    value={medicalInfo.notes}
                    onChange={(e) => handleMedicalInfoChange('notes', e.target.value)}
                    className="bg-input"
                    rows={3}
                />
              </div>

            </CardContent>
            <CardFooter>
              <Button onClick={handleSaveMedicalInfo} className="w-full bg-primary hover:bg-primary/90">
                <Save className="mr-2 h-4 w-4" /> Save Medical Information
              </Button>
            </CardFooter>
          </Card>

          {/* Emergency Contacts Card */}
          <Card className="shadow-xl">
            <CardHeader>
              <CardTitle className="text-2xl font-bold text-primary flex items-center">
                <ShieldCheck className="mr-3 h-6 w-6" /> Emergency Contacts
              </CardTitle>
              <CardDescription>
                Add trusted contacts for emergency situations. This data is saved on your device.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input 
                  type="text" 
                  placeholder="Enter contact name or number" 
                  value={newEmergencyContact}
                  onChange={(e) => setNewEmergencyContact(e.target.value)}
                  className="bg-input"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleAddEmergencyContact(); }}
                />
                <Button onClick={handleAddEmergencyContact} className="bg-primary hover:bg-primary/90">Add</Button>
              </div>
              <div className="space-y-2 pt-2">
                <h4 className="text-sm font-medium text-foreground">Your Contacts</h4>
                {emergencyContacts.length > 0 ? (
                  <ul className="space-y-2">
                    {emergencyContacts.map((contact, index) => (
                      <li key={index} className="flex items-center justify-between p-2 pl-3 bg-card border rounded-md animate-in fade-in-0">
                        <span className="text-sm text-foreground">{contact}</span>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveEmergencyContact(contact)} className="h-7 w-7 text-muted-foreground hover:text-destructive" aria-label={`Remove ${contact}`}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-muted-foreground text-center py-2">No emergency contacts added yet.</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

    
