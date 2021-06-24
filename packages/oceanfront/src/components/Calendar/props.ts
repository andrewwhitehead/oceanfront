import { CalendarEvent, InternalEvent, Timestamp } from "../../lib/calendar/common"
import { PropType } from "vue"

const validTypes = [
    'day', 'month', 'week', 'category', 'ndays', 'month'
]

function validateType(type: string): boolean {
    return validTypes.indexOf(type) >= 0
}

type categoryItem = {
    category: string,
    date: Date
}


export default {
    internal: {
        categoriesList: Array as PropType<categoryItem[]>,
        ignoreCategories: Boolean,
        visibleRange: Array as PropType<Timestamp[]>,
    },
    week: {
        weekStart: { type: [Number, String], default: 0, },
    },
    category: {
        categories: {
            type: Array as PropType<string[]>,
            default: (): string[] => [],
        }
    },
    ndays: {
        numDays: {
            type: [Number, String],
            default: "3",
        }
    },
    month: {
        fixedRowHeight: Boolean,
        eventsLimit: {
            type: [String, Number],
            default: "5",
        },
        hideOtherMonths: Boolean
    },
    common: {
        selectable: Boolean,
        hourIntervals: {
            type: [Number, String],
            default: 4,
        },
        conflictColor: String,
        eventColor: Function as PropType<(e: InternalEvent) => any>,
        type: {
            type: String,
            validator: validateType,
        },
        // exact date for day and category, any date in range for week and month
        day: {
            type: Date as PropType<Date>,
            default: (): Date => new Date,
        },
        layout: String,
        events: Array as PropType<CalendarEvent[]>,
        categoryTitles: {
            type: Boolean,
            default: (): boolean => true,
        },
        hourHeight: { type: [Number, String], default: "48" },
        eventHeight: {
            type: [Number, String],
            default: "20",
        },
        overlapThreshold: { type: [Number, String], default: "45" },
    }
}