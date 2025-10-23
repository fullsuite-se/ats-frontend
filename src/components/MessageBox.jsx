import profileUser from "../assets/profile-user.png";

export default function MessageBox({ message, sender, date }) {
    // Format date to Philippine Time (Asia/Manila) with +8 offset
    const formattedDate = (() => {
        if (!date) return "";
        
        try {
            let dateObj;
            if (date instanceof Date) {
                dateObj = date;
            } else if (typeof date === 'string' || typeof date === 'number') {
                dateObj = new Date(date);
            } else {
                return String(date);
            }
            
            if (isNaN(dateObj.getTime())) {
                return "Invalid date";
            }
            
            // Convert to Philippine time by adding 8 hours to UTC time
            const phTime = new Date(dateObj.getTime() + (8 * 60 * 60 * 1000));
            
            return new Intl.DateTimeFormat("en-PH", {
                timeZone: "Asia/Manila",
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
            }).format(phTime);
        } catch (error) {
            console.error("Error formatting date:", error);
            return String(date);
        }
    })();

    return (
        <div className="my-4 border border-gray-light rounded-lg p-6">
            <div className="mb-3 flex items-center gap-3">
                <div className="relative h-10 w-10 overflow-hidden rounded-full bg-white">
                    <img
                        src={profileUser}
                        alt="User Profile"
                        className="h-full w-full rounded-full object-cover"
                    />
                </div>

                <div className="flex-col">
                    <h3 className="headline text-gray-dark">{sender}</h3>
                    <p className="body-tiny text-gray-400">{formattedDate}</p>
                </div>
            </div>

            <div className="space-y-4 text-gray-dark body-regular">
                <div
                    dangerouslySetInnerHTML={{
                        __html: message,
                    }}
                    className="[&_ul]:list-disc [&_ul]:pl-6
            [&_ol]:list-decimal [&_ol]:pl-6
            [&_em]:font-inherit
            [&_strong]:font-avenir-black
            [&_strong_em]:font-inherit
            [&_em_strong]:font-inherit"
                />
            </div>
        </div>
    );
}