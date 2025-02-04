"use client"

import Image from 'next/image'
import React, { useState } from 'react'
import HomeCard from './HomeCard'
import { useRouter } from 'next/navigation'
import MeetingModal from './MeetingModal'
import { useUser } from '@clerk/nextjs'
import { Call, useStreamVideoClient } from '@stream-io/video-react-sdk'
import { useToast } from "@/components/ui/use-toast"
import { Input } from './ui/input'

const MeetingTypeList = () => {
    const router = useRouter();
    const [meetingState, setMeetingState] = useState<'isScheduleMeeting' | 'isJoiningMeeting' | 'isInstantMeeting' | undefined>();

    const { user } = useUser();
    const client = useStreamVideoClient();

    const [values, setValues] = useState({
        dateTime: new Date(),
        description: '',
        link: '',
    })

    const [callDetails, setCallDetails] = useState<Call>()
    const { toast } = useToast()

    const createMeeting = async () => {
        if (!client || !user) return;

        try {
            if(!values.dateTime) {
                toast({ title: "Please select a date and time", })
                return;
            }
            
            const id = crypto.randomUUID();
            const call = client.call('default', id);

            if (!call) throw new Error('Failed to create call');

            const startsAt = values.dateTime.toISOString() || new Date(Date.now()).toISOString();
            const description = values.description || 'Instant Meeting';

            await call.getOrCreate({
                data: {
                    starts_at: startsAt,
                    custom: {
                        description
                    }
                }
            })

            setCallDetails(call);

            if(!values.description) {
                router.push(`/meeting/${call.id}`)
            }

            toast({ title: "Meeting created", })

        } catch (error) {
            console.log(error);
            toast({ title: "Failed to create meeting", })
        }
    }

    return (
    <section className = "grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-4">
        <HomeCard 
            img="/icons/add-meeting.svg"
            title = "New Meeting"
            description = "Start an instant meeting"
            handleClick = {() => setMeetingState('isInstantMeeting')}
            className = "bg-orange-1"
        />
        <HomeCard 
            img="/icons/schedule.svg"
            title = "Schedule Meeting"
            description = "Plan your meeting"
            handleClick = {() => setMeetingState('isScheduleMeeting')}
            className = "bg-blue-1"
        />
        <HomeCard 
            img="/icons/recordings.svg"
            title = "View Recordings"
            description = "Check out your recordings"
            handleClick = {() => router.push('/recordings')}
            className = "bg-purple-1"
        />
        <HomeCard 
            img="/icons/add-meeting.svg"
            title = "Join Meeting"
            description = "via invitation"
            handleClick = {() => setMeetingState('isJoiningMeeting')}
            className = "bg-yellow-1"
        />

        <MeetingModal 
            isOpen = {meetingState === 'isInstantMeeting'}
            onClose = {() => setMeetingState(undefined)}
            title = "Start an Instant Meeting"
            className = "text-center"
            buttonText = "Start Meeting"
            handleClick = {createMeeting}
        />

        <MeetingModal 
            isOpen = {meetingState === 'isJoiningMeeting'}
            onClose = {() => setMeetingState(undefined)}
            title = "Type the Link Here"
            className = "text-center"
            buttonText = "Join Meeting"
            handleClick = {() => router.push(values.link)}
        >
            <Input placeholder = "Meeting Link" className = "border-none bg-dark-2 focus-visible:ring-0 focus-visible:ring-offset-0" onChange = {(e) => setValues({...values, link: e.target.value})}/>
        </MeetingModal>

    </section>
  )
}

export default MeetingTypeList