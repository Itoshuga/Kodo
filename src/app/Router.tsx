import { Routes, Route } from 'react-router-dom';
import { HomePage } from '../pages/HomePage';
import { TripsPage } from '../pages/TripsPage';
import { TripDetailPage } from '../pages/TripDetailPage';
import { CreateTripPage } from '../pages/CreateTripPage';
import { EditTripPage } from '../pages/EditTripPage';
import { AddStepPage } from '../pages/AddStepPage';
import { EditStepPage } from '../pages/EditStepPage';
import { InvitationsPage } from '../pages/InvitationsPage';

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/trips" element={<TripsPage />} />
      <Route path="/trips/new" element={<CreateTripPage />} />
      <Route path="/trips/:id" element={<TripDetailPage />} />
      <Route path="/trips/:id/edit" element={<EditTripPage />} />
      <Route path="/trips/:id/steps/new" element={<AddStepPage />} />
      <Route path="/trips/:id/steps/:stepId/edit" element={<EditStepPage />} />
      <Route path="/invitations" element={<InvitationsPage />} />
    </Routes>
  );
}
