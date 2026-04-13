import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { X, ArrowRight, Calendar, MapPin, Sparkles } from 'lucide-react';
import { PageLayout } from '../components/layout/PageLayout';
import { FormStepper } from '../components/ui/FormStepper';
import { useTripsStore } from '../store/tripsStore';
import { generateId } from '../utils/ids';

const TOTAL_STEPS = 2;

export function CreateTripPage() {
  const navigate = useNavigate();
  const addTrip = useTripsStore((s) => s.addTrip);

  const [step, setStep] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');

  const canContinue = title.trim().length > 0;

  async function handleSubmit() {
    if (!title.trim()) return;

    const trip = {
      id: generateId(),
      title: title.trim(),
      description: description.trim() || undefined,
      date: date || undefined,
      steps: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await addTrip(trip);
    navigate(`/trips/${trip.id}`);
  }

  return (
    <PageLayout>
      <div className="flex min-h-screen flex-col lg:ml-72">
        <div className="flex items-center justify-between px-4 pt-4">
          <Link
            to="/trips"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-stone-100 text-stone-500 transition-colors hover:bg-stone-200"
            aria-label="Fermer"
          >
            <X className="h-5 w-5" />
          </Link>
          <FormStepper total={TOTAL_STEPS} current={step} />
        </div>

        <div className="flex flex-1 flex-col px-6 pb-24 pt-8 lg:mx-auto lg:w-full lg:max-w-xl lg:pt-12">
          {step === 0 && (
            <div className="flex flex-1 flex-col">
              <div className="mb-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl gradient-hero">
                  <MapPin className="h-6 w-6 text-white" />
                </div>
                <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800 lg:text-4xl">
                  Ou allez-vous ?
                </h1>
                <p className="mt-3 text-base leading-relaxed text-stone-500">
                  Nommez votre trajet pour le retrouver facilement.
                </p>
              </div>

              <div className="relative mb-8">
                <input
                  type="text"
                  autoFocus
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Tokyo vers Kyoto"
                  className="input-floating text-xl"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && canContinue) {
                      e.preventDefault();
                      setStep(1);
                    }
                  }}
                />
                <label className="pointer-events-none absolute left-0 top-0 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Nom du trajet
                </label>
              </div>

              <div className="mt-auto">
                <button
                  type="button"
                  disabled={!canContinue}
                  onClick={() => setStep(1)}
                  className="btn-primary form-nav-primary-btn w-full"
                >
                  Continuer
                  <ArrowRight className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="flex flex-1 flex-col">
              <div className="mb-10">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-stone-100">
                  <Sparkles className="h-6 w-6 text-stone-600" />
                </div>
                <h1 className="font-brand text-3xl font-bold tracking-tight text-stone-800 lg:text-4xl">
                  Quelques détails
                </h1>
                <p className="mt-3 text-base leading-relaxed text-stone-500">
                  Optionnel. Vous pouvez compléter plus tard.
                </p>
              </div>

              <div className="space-y-8">
                <div className="relative">
                  <div className="flex items-center gap-3 border-b-2 border-stone-200 pb-3 transition-colors focus-within:border-teal-600">
                    <Calendar className="h-5 w-5 flex-shrink-0 text-stone-400" />
                    <div className="flex-1">
                      <label htmlFor="date" className="mb-1 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                        Date du trajet
                      </label>
                      <input
                        id="date"
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="w-full border-0 bg-transparent p-0 text-base font-medium text-stone-800 outline-none"
                      />
                    </div>
                  </div>
                </div>

                <div className="relative">
                  <label htmlFor="description" className="mb-2 block text-xs font-semibold uppercase tracking-wider text-stone-400">
                    Notes
                  </label>
                  <textarea
                    id="description"
                    rows={3}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Premier jour, départ tot le matin..."
                    className="w-full resize-none rounded-2xl border-2 border-stone-200 bg-stone-50/50 px-4 py-3 text-base font-medium text-stone-800 placeholder:text-stone-300 transition-colors focus:border-teal-600 focus:bg-white focus:outline-none"
                  />
                </div>
              </div>

              <div className="mt-auto flex gap-3 pt-10">
                <button
                  type="button"
                  onClick={() => setStep(0)}
                  className="form-nav-icon-btn"
                >
                  <ArrowRight className="h-5 w-5 rotate-180" />
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="btn-primary form-nav-primary-btn flex-1"
                >
                  Créer le trajet
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </PageLayout>
  );
}


