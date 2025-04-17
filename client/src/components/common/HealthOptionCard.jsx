/* eslint-disable react/prop-types */
import { ImageIcon } from "lucide-react";
import clsx from "clsx";

export default function HealthOptionCard({ label, variant }) {
    const isDrawer = variant === "drawer";

    return (
        <div
            className={clsx(
                "flex items-center gap-4 px-4 py-3 border border-gray-300 bg-white transition cursor-pointer",
                {
                    "hover:shadow-md rounded-full": !isDrawer,
                    "w-full rounded-xl": isDrawer,
                }
            )}
        >
            <span className="w-8 h-8 md:w-5 md:h-5 flex items-center justify-center bg-white border border-blue-500 rounded-sm shrink-0">
                <ImageIcon className="w-4 h-4 md:w-3.5 md:h-3.5 text-blue-500" />
            </span>
            <span className="text-sm text-[#061140] font-bold text-left">{label}</span>
        </div>
    );
}
