/* eslint-disable react/prop-types */
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
            <img
                src="/icon_image.png"
                alt="icon"
                className="w-8 h-8 md:w-5 md:h-5 rounded-sm object-contain"
            />
            <span style={{ fontFamily: 'Karla' }} className="text-sm text-[#061140] font-bold text-left">{label}</span>
        </div>
    );
}
