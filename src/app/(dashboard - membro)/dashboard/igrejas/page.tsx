"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PlusCircle, Edit, Trash2, SearchX, Church, Users, UserPlus } from 'lucide-react';
import {
    Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter
} from "@/components/ui/dialog";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useAuth } from '@/hooks/useAuth'; // Import useAuth
import ClienteIgrejas from './_components/clienteIgrejas';

export default function IgrejaManagementPage() {
    return (
        <ClienteIgrejas />
    )
}
