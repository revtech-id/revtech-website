import React from 'react';

export const DropdownMenu = ({ children }: any) => <div className="relative inline-block">{children}</div>;
export const DropdownMenuTrigger = ({ children }: any) => <div>{children}</div>;
export const DropdownMenuContent = ({ children }: any) => <div className="absolute bottom-full left-0 mb-2 w-full bg-white border border-gray-100 p-2 shadow-xl rounded-xl z-50 flex flex-col gap-1">{children}</div>;
export const DropdownMenuItem = ({ children, onClick }: any) => <div onClick={onClick} className="cursor-pointer hover:bg-gray-50 px-2 py-1.5 rounded-lg text-sm">{children}</div>;
export const DropdownMenuSeparator = () => <hr className="my-1 border-gray-100" />;
