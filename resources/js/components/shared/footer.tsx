import { Link } from '@inertiajs/react';
import { ExternalLink, Heart, Mail, MapPin, Phone, Search } from 'lucide-react';
import SafeWidth from '../safe-width';

export default function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
            <SafeWidth className="px-4 py-12 md:px-0 md:py-16">
                <div className="grid grid-cols-1 gap-8 md:gap-12 lg:grid-cols-4">
                    {/* Brand Section */}
                    <div className="lg:col-span-2">
                        <div className="mb-6 text-center md:text-left">
                            <h3 className="font-luckiest bg-gradient-to-r from-blue-400 to-blue-700 bg-clip-text text-3xl text-transparent md:text-4xl lg:text-5xl">
                                NITISARA
                            </h3>
                            <p className="mt-3 text-base text-slate-300 md:mt-4 md:text-lg">
                                Festival Film Mahasiswa Terbesar di Indonesia
                            </p>
                        </div>
                        <p className="mb-4 text-center text-sm leading-relaxed text-slate-400 md:text-left md:text-base">
                            Platform inovatif untuk mahasiswa Indonesia mengekspresikan kreativitas melalui medium film.
                            Bergabunglah dengan ribuan talenta muda dalam perjalanan sinematik yang tak terlupakan.
                        </p>
                        <p className="mb-6 text-center text-sm text-slate-400 md:text-left">
                            A product of <span className="font-semibold text-white">PTI Undiksha</span>
                        </p>
                        <div className="flex flex-col gap-3 md:flex-row md:gap-4">
                            <Link
                                href="/status"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-3 text-sm font-medium text-white transition-all duration-300 hover:scale-105 hover:from-blue-700 hover:to-indigo-700 hover:shadow-lg md:w-auto"
                            >
                                <Search className="h-4 w-4" />
                                Cek Status Pendaftaran
                            </Link>
                            <Link
                                href="/registration"
                                className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-600 px-6 py-3 text-sm font-medium text-slate-300 transition-all duration-300 hover:border-slate-500 hover:bg-slate-800 hover:text-white md:w-auto"
                            >
                                Daftar Sekarang
                                <ExternalLink className="h-4 w-4" />
                            </Link>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 text-lg font-semibold text-white md:mb-6">Tautan Cepat</h4>
                        <ul className="space-y-2 md:space-y-3">
                            <li>
                                <Link
                                    href="/"
                                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-white md:text-base"
                                >
                                    Beranda
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/film"
                                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-white md:text-base"
                                >
                                    Jelajahi Film
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/registration"
                                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-white md:text-base"
                                >
                                    Pendaftaran
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/status"
                                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-white md:text-base"
                                >
                                    Cek Status
                                </Link>
                            </li>
                            <li>
                                <Link
                                    href="/contact"
                                    className="text-sm text-slate-400 transition-colors duration-200 hover:text-white md:text-base"
                                >
                                    Kontak
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="text-center md:text-left">
                        <h4 className="mb-4 text-lg font-semibold text-white md:mb-6">Hubungi Kami</h4>
                        <div className="space-y-3 md:space-y-4">
                            <div className="flex items-start justify-center gap-3 md:justify-start">
                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-blue-600/20">
                                    <MapPin className="h-3 w-3 text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 md:text-sm">
                                        Universitas Pendidikan Ganesha
                                        <br />
                                        Singaraja, Bali, Indonesia
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center justify-center gap-3 md:justify-start">
                                <div className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-purple-600/20">
                                    <Phone className="h-3 w-3 text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-xs text-slate-400 md:text-sm">
                                        +62 858-5891-8243
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Section */}
                <div className="mt-8 border-t border-slate-700 pt-6 md:mt-12 md:pt-8">
                    <div className="flex flex-col items-center gap-4 md:flex-row md:justify-between">
                        <div className="flex items-center gap-2 text-center text-xs text-slate-400 md:text-sm">
                            <span>© {currentYear} NITISARA. Made with</span>
                            <Heart className="h-3 w-3 fill-current text-red-500 md:h-4 md:w-4" />
                            <span>by</span>
                            <span className="font-semibold text-white">Dedan Labs</span>
                        </div>
                        <div className="flex flex-col items-center gap-3 text-xs md:flex-row md:gap-6 md:text-sm">
                            <Link
                                href="/privacy"
                                className="text-slate-400 transition-colors duration-200 hover:text-white"
                            >
                                Privasi
                            </Link>
                            <Link
                                href="/terms"
                                className="text-slate-400 transition-colors duration-200 hover:text-white"
                            >
                                Ketentuan
                            </Link>
                        </div>
                    </div>
                </div>
            </SafeWidth>
        </footer>
    );
}
