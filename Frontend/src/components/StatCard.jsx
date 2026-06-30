export const StatCard = ({ title, value, subtitle, icon: Icon, colorClass="bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" }) => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl p-6 shadow-sm border border-gray-100 dark:border-gray-800 flex items-start justify-between transition-colors duration-200">
        <div>
            <p className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                {title}
            </p>

            <h4 className="text-3xl font-bold text-gray-800 dark:text-white">
                {value}
            </h4>

            {subtitle && (
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
                    {subtitle}
                </p>
            )}
        </div>

        <div className={`p-3 rounded-xl ${colorClass}`}>
            <Icon className="w-6 h-6" />
        </div>
    </div>
);
