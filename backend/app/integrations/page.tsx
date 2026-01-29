"use client";

import { PlugZap } from "lucide-react";

const NoIntegrations = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center rounded-xl border border-gray-800 bg-black/60 backdrop-blur-sm p-10">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-blue-600/10 mb-4">
        <PlugZap className="h-7 w-7 text-blue-500" />
      </div>

      <h3 className="text-lg font-semibold text-white">
        Oops! No integrations available 😅
      </h3>

      <p className="mt-2 text-sm text-gray-400 max-w-sm">
        Integrations are coming soon. We’re working on connecting your favorite
        tools.
      </p>
    </div>
  );
};

export default NoIntegrations;
