"use client";

import React from "react";
import CountUp from "react-countup";

type Props = {
    end: number;
    duration?: number;
    separator?: string;
    prefix?: string;
    suffix?: string;
    className?: string;
    startOnVisible?: boolean;
    scrollSpyOnce?: boolean;
};

export default function CountUpStat({
    end,
    duration = 2,
    separator = ",",
    prefix = "",
    suffix = "",
    startOnVisible = true,
    scrollSpyOnce = true,
    className = "",
}: Props) {
    return (
        <CountUp
            start={0}
            end={end}
            duration={duration}
            separator={separator}
            prefix={prefix}
            suffix={suffix}
            enableScrollSpy={startOnVisible}
            scrollSpyOnce={scrollSpyOnce}
        >
            {({ countUpRef }) => <span ref={countUpRef} className={className} />}
        </CountUp>
    );
}
