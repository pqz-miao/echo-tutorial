"use client";

import { useMutation, useQuery } from "convex/react";
import { api } from "@workspace/backend/_generated/api";
import { Button } from "@workspace/ui/components/button";

export default function Page() {
  const users = useQuery(api.users.getMany);
  const addUser = useMutation(api.users.add);

  return (
    <div className="flex flex-col items-center justify-center min-h-svh">
      <p>apps/widget</p>
      <Button onClick={() => addUser()}>Add John Doe</Button>
      <div className="max-w-lg w-full mx-auto">
        {JSON.stringify(users, null, 2)}
      </div>
    </div>
  );
}
