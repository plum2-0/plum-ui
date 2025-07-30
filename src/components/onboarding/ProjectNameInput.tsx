interface ProjectNameInputProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function ProjectNameInput({ value, onChange }: ProjectNameInputProps) {
  return (
    <div className="bg-white/10 rounded-lg p-4 mb-6">
      <h3 className="text-lg font-semibold text-white mb-2">
        Enter Your Project Name:
      </h3>
      <p className="text-purple-100 mb-4">
        This will help us personalize your monitoring experience.
      </p>
      <input
        type="text"
        value={value}
        onChange={onChange}
        placeholder="e.g., My Awesome SaaS"
        className="w-full px-4 py-3 rounded-lg bg-white/20 text-white placeholder-purple-200 border border-white/30 focus:border-white focus:outline-none focus:ring-2 focus:ring-white/30 transition-colors"
        required
      />
    </div>
  );
}