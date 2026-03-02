type UserProfileInfoProps = {
  profileName: string;
};

const profileData = {
  fullName: "Kitti Phrom",
  phone: "+66 81 234 5678",
  email: "kitti@example.com",
  lineId: "kitti.line",
  preferredContact: "WhatsApp, LINE",
  defaultPickupAirport: "Suvarnabhumi Airport (BKK)",
  defaultDestination: "Sukhumvit, Bangkok",
};

export function UserProfileInfo({ profileName }: UserProfileInfoProps) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 sm:p-5">
      <h2 className="text-lg font-semibold text-slate-900">Profile Information</h2>
      <p className="mt-1 text-base text-slate-600">
        ข้อมูลผู้ใช้งานสำหรับการจองรถและการติดต่อ
      </p>

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Display Name</p>
          <p className="mt-1 text-base font-medium text-slate-900">{profileName}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Full Name</p>
          <p className="mt-1 text-base font-medium text-slate-900">{profileData.fullName}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Phone</p>
          <p className="mt-1 text-base font-medium text-slate-900">{profileData.phone}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Email</p>
          <p className="mt-1 text-base font-medium text-slate-900">{profileData.email}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">LINE ID</p>
          <p className="mt-1 text-base font-medium text-slate-900">{profileData.lineId}</p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Preferred Contact</p>
          <p className="mt-1 text-base font-medium text-slate-900">
            {profileData.preferredContact}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Default Airport</p>
          <p className="mt-1 text-base font-medium text-slate-900">
            {profileData.defaultPickupAirport}
          </p>
        </article>
        <article className="rounded-xl border border-slate-200 bg-slate-50 p-3">
          <p className="text-xs uppercase tracking-wide text-slate-500">Default Destination</p>
          <p className="mt-1 text-base font-medium text-slate-900">
            {profileData.defaultDestination}
          </p>
        </article>
      </div>
    </section>
  );
}
