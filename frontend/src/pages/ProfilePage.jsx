import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import FormInput from '../components/FormInput';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import api, { getErrorMessage } from '../services/api';

const schema = z.object({
  name: z.string().min(1),
  email: z.string().email(),
});

export default function ProfilePage() {
  const { user, refreshMe } = useAuth();
  const { showToast } = useToast();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    values: { name: user?.name || '', email: user?.email || '' },
  });

  const onSubmit = async (values) => {
    try {
      await api.put(`/users/${user.id}`, values);
      await refreshMe();
      showToast('Profile updated');
    } catch (err) {
      showToast(getErrorMessage(err), 'error');
    }
  };

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <h1 className="text-2xl font-semibold">Profile</h1>
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm"
      >
        <FormInput label="Name" error={errors.name?.message} {...register('name')} />
        <FormInput label="Email" type="email" error={errors.email?.message} {...register('email')} />
        <p className="text-sm text-slate-500 capitalize">Role: {user?.role}</p>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-brand-700 px-4 py-2 text-sm text-white"
        >
          Save changes
        </button>
      </form>
    </div>
  );
}
